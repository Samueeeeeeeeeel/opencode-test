'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

function subscribeAll() {
  return () => {};
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeAll,
    () => true,
    () => false
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/80">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="text-lg font-bold">
          Aford
        </Link>

        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
