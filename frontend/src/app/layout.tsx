import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-provider';
import { StakeholderSwitcher } from '@/components/layout/StakeholderSwitcher';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SkillSync AIIA | AI-Powered Academia × Industry Skill Intelligence Platform',
  description: 'National Portal for Academia–Industry Collaboration for Skill Mapping, Internships and Placement under Ministry of Ayush / All India Institute of Ayurveda (SIH Problem Statement 26044).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans bg-background text-foreground antialiased min-h-screen flex flex-col selection:bg-accent/20 selection:text-accent">
        <ThemeProvider>
          <AuthProvider>
            {/* 1. Global Stakeholder Role Switcher */}
            <StakeholderSwitcher />

            {/* 2. Global Top Navbar */}
            <Navbar />

            {/* 3. Main Workspace Shell */}
            <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row">
              <Sidebar />
              <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                {children}
              </main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
