'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { analysisQueue } from '@/lib/analysisQueue';
import { db } from '@/lib/db';
import { checkBadges } from '@/lib/progress';
import { useSettings } from '@/lib/store';
import { initSync } from '@/lib/sync';
import { subscribeToasts, type ToastMsg } from '@/lib/toast';
import { cn } from '@/lib/util';

const TABS = [
  { href: '/', label: 'Today', icon: 'M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1z' },
  { href: '/learn/', label: 'Learn', icon: 'M5 4.5h5.5A1.5 1.5 0 0 1 12 6v13a1.5 1.5 0 0 0-1.5-1.5H5zM19 4.5h-5.5A1.5 1.5 0 0 0 12 6v13a1.5 1.5 0 0 1 1.5-1.5H19z' },
  { href: '/train/', label: 'Train', icon: 'M12 3v4m0 10v4M3 12h4m10 0h4M7 7l2 2m6 6 2 2M17 7l-2 2M9 15l-2 2' },
  { href: '/insights/', label: 'Insights', icon: 'M5 20V11m7 9V5m7 15v-7' },
  { href: '/profile/', label: 'Profile', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0' },
];

function norm(p: string) {
  return p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p;
}

function ToastHost() {
  const [t, setT] = useState<ToastMsg | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const off = subscribeToasts((m) => {
      setT(m);
      clearTimeout(timer);
      timer = setTimeout(() => setT(null), 2200);
    });
    return () => {
      off();
      clearTimeout(timer);
    };
  }, []);
  if (!t) return null;
  return (
    <div
      key={t.id}
      role="status"
      className="anim-toast pointer-events-none fixed left-1/2 z-50 flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-[14px] shadow-sm"
      style={{ top: 'calc(env(safe-area-inset-top) + 12px)' }}
    >
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', t.kind === 'info' ? 'bg-muted' : 'bg-accent')} />
      {t.text}
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = norm(usePathname() ?? '/');
  const router = useRouter();
  const settings = useSettings();
  const isTab = TABS.some((t) => norm(t.href) === pathname);

  useEffect(() => {
    initSync();
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
    void checkBadges();
  }, []);

  // first-run redirect
  useEffect(() => {
    if (settings.loaded && !settings.onboarded && pathname !== '/onboarding' && pathname !== '/profile') {
      void db.games.count().then((n) => {
        if (n === 0) router.replace('/onboarding/');
      });
    }
  }, [settings.loaded, settings.onboarded, pathname, router]);

  // auto-resume background analysis
  useEffect(() => {
    if (!settings.loaded || !settings.onboarded || !settings.autoAnalyze) return;
    void (async () => {
      await analysisQueue.refreshCounts();
      const s = analysisQueue.getState();
      if (s.done < s.total && !s.paused) analysisQueue.start();
    })();
  }, [settings.loaded, settings.onboarded, settings.autoAnalyze]);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[560px]">
      <ToastHost />
      <main className={cn('safe-top', isTab ? 'pb-[calc(88px+env(safe-area-inset-bottom))]' : 'pb-[calc(32px+env(safe-area-inset-bottom))]')}>
        {children}
      </main>
      {isTab ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/90 backdrop-blur"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <ul className="mx-auto flex max-w-[560px]">
            {TABS.map((t) => {
              const active = norm(t.href) === pathname;
              return (
                <li key={t.href} className="flex-1">
                  <Link
                    href={t.href}
                    className={cn('flex min-h-[64px] flex-col items-center justify-center gap-1 text-[11px]', active ? 'text-accent' : 'text-muted')}
                    aria-current={active ? 'page' : undefined}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                      <path d={t.icon} />
                    </svg>
                    {t.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
