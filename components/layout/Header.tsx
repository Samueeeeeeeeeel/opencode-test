'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

function subscribeAll() {
  return () => {};
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'es';
  const mounted = useSyncExternalStore(
    subscribeAll,
    () => true,
    () => false
  );

  return (
    <header className="sticky top-0 z-40 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/dashboard" className="text-lg font-bold text-white">
          Aford
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/profile"
            className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            aria-label="Perfil"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              )}
            </button>
          )}
          <button
            onClick={() => signOut({ callbackUrl: `${window.location.origin}/${locale}/login` })}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            aria-label="Cerrar sesión"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
