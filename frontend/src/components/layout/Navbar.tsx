'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-provider';
import { apiFetch } from '@/lib/api';
import {
  Bell,
  Search,
  CheckCircle2,
  AlertCircle,
  LogOut,
  User,
  Layers,
  ChevronDown,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export function Navbar() {
  const { user, role, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    apiFetch<any[]>('/notifications')
      .then((data) => setNotifications(data || []))
      .catch(() => setNotifications([]));
  }, [role]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-[33px] z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 py-2 flex items-center justify-between gap-4">
        {/* Brand & Ministry Affiliation */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-md bg-surface-elevated border border-border flex items-center justify-center text-accent font-mono font-bold text-xs group-hover:border-accent/50 transition-colors">
              SS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base tracking-tight text-foreground">
                  SkillSync
                </span>
                <span className="text-[10px] uppercase font-mono font-medium px-1.5 py-0.2 rounded bg-surface-elevated text-foreground-subtle border border-border">
                  AIIA • Ayush
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Global Search Command Bar (Supabase / Linear style) */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <Link
            href="/student/internships"
            className="w-full flex items-center justify-between px-3 py-1.5 bg-surface-elevated hover:bg-surface-hover border border-border rounded-md text-xs text-foreground-muted transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-foreground-subtle group-hover:text-foreground transition-colors" />
              <span>Search skills, internships, roles...</span>
            </div>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-foreground-subtle bg-surface border border-border rounded shadow-xs">
              ⌘K
            </kbd>
          </Link>
        </div>

        {/* Right Action Icons, Theme Toggle & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowNotifications(false);
                setShowProfileMenu(false);
              }}
              className="p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-elevated rounded-md border border-transparent hover:border-border transition-all"
              title="Switch Theme"
              aria-label="Switch Theme"
            >
              {resolvedTheme === 'dark' ? (
                <Moon className="w-3.5 h-3.5" />
              ) : (
                <Sun className="w-3.5 h-3.5" />
              )}
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-1.5 w-32 bg-surface rounded-md border border-border shadow-elevation py-1 z-50 animate-fade-in text-xs">
                <button
                  onClick={() => {
                    setTheme('light');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-surface-hover transition-colors ${
                    theme === 'light' ? 'text-accent font-medium' : 'text-foreground-muted'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => {
                    setTheme('dark');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-surface-hover transition-colors ${
                    theme === 'dark' ? 'text-accent font-medium' : 'text-foreground-muted'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => {
                    setTheme('system');
                    setShowThemeMenu(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 hover:bg-surface-hover transition-colors ${
                    theme === 'system' ? 'text-accent font-medium' : 'text-foreground-muted'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>System</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
                setShowThemeMenu(false);
              }}
              className="relative p-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-elevated rounded-md border border-transparent hover:border-border transition-all"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent ring-2 ring-surface"></span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-surface rounded-lg shadow-elevation border border-border overflow-hidden z-50 animate-fade-in">
                <div className="p-3 bg-surface-elevated border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs text-foreground">Notifications</span>
                    {unreadCount > 0 && (
                      <Badge variant="success" size="sm">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-foreground-subtle font-mono">Live feed</span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-foreground-subtle">
                      No notifications right now
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3 text-xs hover:bg-surface-hover transition-colors cursor-pointer flex gap-2.5 ${
                          !n.isRead ? 'bg-accent/5' : ''
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {n.type === 'SUCCESS' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-warning" />
                          )}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <p className="font-medium text-foreground">{n.title}</p>
                          <p className="text-foreground-muted text-[11px] leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-foreground-subtle block font-mono">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
                setShowThemeMenu(false);
              }}
              className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 hover:bg-surface-elevated rounded-md border border-transparent hover:border-border transition-all"
            >
              <div className="w-6 h-6 rounded bg-surface-elevated text-accent font-semibold flex items-center justify-center text-xs border border-border">
                {user?.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-foreground leading-tight">
                  {user?.name || 'Authorized User'}
                </p>
                <p className="text-[10px] text-foreground-subtle capitalize">
                  {role?.toLowerCase()}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-foreground-subtle hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-1.5 w-52 bg-surface rounded-md shadow-elevation border border-border py-1 z-50 animate-fade-in text-xs">
                <div className="px-3 py-2 border-b border-border">
                  <p className="font-medium text-foreground">{user?.name}</p>
                  <p className="text-foreground-subtle text-[11px] truncate font-mono">{user?.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    href="/student/portfolio"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-foreground-subtle" />
                    <span>Digital Portfolio</span>
                  </Link>
                  <Link
                    href="/collaborations"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-3 py-1.5 text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-foreground-subtle" />
                    <span>Collaboration Hub</span>
                  </Link>
                </div>

                <div className="border-t border-border pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-destructive hover:bg-destructive/10 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
