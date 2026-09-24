import { Router, Request, Response } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../../lib/auth-middleware';
import { ApplicationStatus, TaskStatus } from '@skillsync/shared';

export const lifecycleRouter = Router();

// 1. Submit Application
lifecycleRouter.post('/applications', authenticate, async (req: Request, res: Response) => {
  try {
    const { opportunityId, notes, matchPercentage, matchExplanation } = req.body;

    const student = await prisma.studentProfile.findFirst();
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const existing = await prisma.application.findFirst({
      where: {
        opportunityId,
        applicantId: student.id
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'You have already applied for this opportunity.' });
    }

    const application = await prisma.application.create({
      data: {
        opportunityId,
        applicantId: student.id,
        applicantRole: 'STUDENT',
        status: ApplicationStatus.APPLIED,
        matchPercentage: matchPercentage || 85.0,
        matchExplanationJson: matchExplanation ? JSON.stringify(matchExplanation) : null,
        notes: notes || 'Excited to contribute to this role.'
      },
      include: { opportunity: true }
    });

    // Create confirmation notification
    const user = await prisma.user.findFirst({ where: { studentProfile: { id: student.id } } });
    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: `Application Submitted: ${application.opportunity.title}`,
          message: `Your application to ${application.opportunity.companyName} was submitted successfully with an AI match score of ${application.matchPercentage}%.`,
          type: 'INFO'
        }
      });
    }

    return res.status(201).json(application);
  } catch (error) {
    console.error('Application submit error:', error);
    return res.status(500).json({ error: 'Failed to submit application' });
  }
});

// 2. Student Applications
lifecycleRouter.get('/applications/student', authenticate, async (_req: Request, res: Response) => {
  try {
    const student = await prisma.studentProfile.findFirst();
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const applications = await prisma.application.findMany({
      where: { applicantId: student.id },
      include: { opportunity: true },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(
      applications.map((a) => ({
        id: a.id,
        opportunityId: a.opportunityId,
        opportunityTitle: a.opportunity.title,
        opportunityType: a.opportunity.type,
        companyName: a.opportunity.companyName,
        status: a.status,
        matchPercentage: a.matchPercentage,
        appliedDate: a.createdAt.toISOString(),
        interviewDate: a.interviewDate,
        interviewMeetingLink: a.interviewMeetingLink,
        notes: a.notes,
        feedback: a.feedback
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch student applications' });
  }
});

// 3. Industry / Recruiter Candidate Pipeline
lifecycleRouter.get('/applications/industry', authenticate, async (_req: Request, res: Response) => {
  try {
    const applications = await prisma.application.findMany({
      include: {
        opportunity: true,
        applicant: {
          include: {
            user: true,
            skillScores: { include: { skill: true } }
          }
        }
      },
      orderBy: { matchPercentage: 'desc' }
    });

    return res.json(
      applications.map((a) => ({
        id: a.id,
        opportunityId: a.opportunityId,
        opportunityTitle: a.opportunity.title,
        companyName: a.opportunity.companyName,
        candidateName: a.applicant.user.name,
        candidateEmail: a.applicant.user.email,
        candidateBranch: a.applicant.branch,
        candidateYear: a.applicant.currentYear,
        candidateCgpa: a.applicant.cgpa,
        status: a.status,
        matchPercentage: a.matchPercentage,
        appliedDate: a.createdAt.toISOString(),
        interviewDate: a.interviewDate,
        interviewMeetingLink: a.interviewMeetingLink,
        topSkills: a.applicant.skillScores.slice(0, 4).map((s) => ({
          name: s.skill.name,
          score: s.score,
          verified: s.verified
        }))
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch industry applications' });
  }
});

// 4. Update Application Status (Shortlist, Interview, Offer, Reject)
lifecycleRouter.patch('/applications/:id/status', authenticate, async (req: Request, res: Response) => {
  try {
    const { status, interviewDate, interviewMeetingLink, feedback } = req.body;

    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        status,
        interviewDate,
        interviewMeetingLink,
        feedback
      },
      include: {
        opportunity: true,
        applicant: { include: { user: true } }
      }
    });

    // Notify applicant of status progression
    await prisma.notification.create({
      data: {
        userId: updated.applicant.userId,
        title: `Application Status Updated: ${status}`,
        message: `Your application for ${updated.opportunity.title} at ${updated.opportunity.companyName} has moved to ${status}.`,
        type: status === 'SELECTED' || status === 'OFFER_EXTENDED' ? 'SUCCESS' : 'INFO'
      }
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update application status' });
  }
});

// 5. Active Internship Workspace for Student
lifecycleRouter.get('/workspace/active', authenticate, async (_req: Request, res: Response) => {
  try {
    const student = await prisma.studentProfile.findFirst();
    if (!student) return res.status(404).json({ error: 'Student not found' });

    const workspace = await prisma.internshipWorkspace.findFirst({
      where: { studentId: student.id },
      include: {
        opportunity: true,
        tasks: { orderBy: { dueDate: 'asc' } },
        weeklyReports: { orderBy: { weekNumber: 'desc' } }
      }
    });

    if (!workspace) {
      return res.json(null);
    }

    return res.json({
      id: workspace.id,
      opportunityId: workspace.opportunityId,
      opportunityTitle: workspace.opportunity.title,
      companyName: workspace.opportunity.companyName,
      mentorName: workspace.mentorName,
      mentorEmail: workspace.mentorEmail,
      startDate: workspace.startDate,
      endDate: workspace.endDate,
      status: workspace.status,
      attendanceRate: workspace.attendanceRate,
      tasks: workspace.tasks.map((t) => ({
        id: t.id,
        workspaceId: t.workspaceId,
        title: t.title,
        description: t.description,
        assignedBy: t.assignedBy,
        dueDate: t.dueDate,
        status: t.status,
        deliverableUrl: t.deliverableUrl,
        studentNotes: t.studentNotes,
        mentorFeedback: t.mentorFeedback,
        grade: t.grade
      })),
      weeklyReports: workspace.weeklyReports.map((r) => ({
        id: r.id,
        workspaceId: r.workspaceId,
        weekNumber: r.weekNumber,
        hoursWorked: r.hoursWorked,
        summary: r.summary,
        keyLearnings: JSON.parse(r.keyLearnings || '[]'),
        blockers: r.blockers,
        mentorStatus: r.mentorStatus,
        mentorComments: r.mentorComments,
        submittedAt: r.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Fetch workspace error:', error);
    return res.status(500).json({ error: 'Failed to fetch internship workspace' });
  }
});

// 6. Update Task Status
lifecycleRouter.patch('/workspace/tasks/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { status, deliverableUrl, studentNotes, mentorFeedback, grade } = req.body;

    const task = await prisma.internshipTask.update({
      where: { id: req.params.id },
      data: {
        status,
        deliverableUrl,
        studentNotes,
        mentorFeedback,
        grade
      }
    });

    return res.json(task);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

// 7. Submit Weekly Work Report
lifecycleRouter.post('/workspace/reports', authenticate, async (req: Request, res: Response) => {
  try {
    const { workspaceId, weekNumber, hoursWorked, summary, keyLearnings, blockers } = req.body;

    const report = await prisma.weeklyReport.create({
      data: {
        workspaceId,
        weekNumber: Number(weekNumber) || 1,
        hoursWorked: Number(hoursWorked) || 35,
        summary,
        keyLearnings: JSON.stringify(keyLearnings || []),
        blockers: blockers || '',
        mentorStatus: 'PENDING'
      }
    });

    return res.status(201).json(report);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to submit weekly report' });
  }
});

// 8. Final Internship Evaluation & Verified Certificate Issuance
lifecycleRouter.post('/workspace/:id/evaluate', authenticate, async (req: Request, res: Response) => {
  try {
    const { technicalScore, softSkillScore, initiativeScore, overallFeedback } = req.body;

    const workspace = await prisma.internshipWorkspace.findUnique({
      where: { id: req.params.id },
      include: { opportunity: true, student: true }
    });

    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });

    const certCode = `SKILLSYNC-CERT-${Date.now().toString(36).toUpperCase()}`;

    // Issue verified certificate
    const cert = await prisma.verifiedCertificate.create({
      data: {
        studentId: workspace.studentId,
        title: `Certificate of Completion: ${workspace.opportunity.title}`,
        issuingOrganization: workspace.opportunity.companyName,
        issueDate: new Date().toISOString().split('T')[0],
        verificationCode: certCode,
        verificationStatus: 'VERIFIED',
        verifiedBy: `Verified by Industry Mentor ${workspace.mentorName}`
      }
    });

    // Mark workspace completed
    await prisma.internshipWorkspace.update({
      where: { id: workspace.id },
      data: {
        status: 'COMPLETED',
        finalEvaluation: JSON.stringify({
          technicalScore,
          softSkillScore,
          initiativeScore,
          overallFeedback,
          certificateCode: certCode
        })
      }
    });

    return res.json({
      success: true,
      certificateCode: certCode,
      certificate: cert
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to submit final evaluation' });
  }
});
