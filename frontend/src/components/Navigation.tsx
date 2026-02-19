/**
 * Navigation component for Blinch
 * Provides consistent navigation across all pages
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getAllActions } from '@/lib/storage';

export function Navigation() {
  const pathname = usePathname();
  const userActionCount = getAllActions().length;

  const navLinks = [
    { href: '/', label: 'Home', match: /^\/$/ },
    { href: '/create', label: 'Create', match: /^\/create/ },
    { href: '/docs', label: 'Docs', match: /^\/docs/ },
  ];

  // Only show dashboard if user has actions
  if (userActionCount > 0) {
    navLinks.splice(2, 0, {
      href: '/dashboard',
      label: 'Dashboard',
      match: /^\/dashboard/,
    });
  }

  return (
    <header className="border-b border-white/10 glass">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold gradient-text">Blinch</h1>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.match.test(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {link.label}
                  {link.href === '/dashboard' && userActionCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent">
                      {userActionCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden mt-4 flex flex-wrap gap-2">
          {navLinks.map((link) => {
            const isActive = link.match.test(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                  ${isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                {link.label}
                {link.href === '/dashboard' && userActionCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-accent/20 text-accent">
                    {userActionCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
