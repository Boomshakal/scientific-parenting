'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '首页', emoji: '🏠' },
  { href: '/growth', label: '生长', emoji: '📏' },
  { href: '/feeding', label: '饮食', emoji: '🍼' },
  { href: '/sleep', label: '睡眠', emoji: '😴' },
  { href: '/milestone', label: '里程碑', emoji: '🎉' },
  { href: '/health', label: '健康', emoji: '🏥' },
  { href: '/mood', label: '情绪', emoji: '😊' },
  { href: '/education', label: '早教', emoji: '📚' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="hidden md:flex bg-white/80 backdrop-blur-lg border-b-2 border-pink-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto w-full px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-3xl group-hover:animate-bounce-soft transition-all">👶</span>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-pink-600 bg-clip-text text-transparent">
              育娃记录
            </h1>
            <p className="text-xs text-gray-400">记录成长每一刻</p>
          </div>
        </Link>

        <nav className="flex gap-1 items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
                  ${isActive
                    ? 'bg-pink-400 text-white shadow-lg shadow-pink-200'
                    : 'text-gray-600 hover:bg-pink-50'
                  }
                `}
              >
                <span>{item.emoji}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
          <Link
            href="/settings"
            className={`
              px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
              ${pathname === '/settings'
                ? 'bg-pink-400 text-white shadow-lg shadow-pink-200'
                : 'text-gray-600 hover:bg-pink-50'
              }
            `}
          >
            <span>⚙️</span>
            <span className="hidden lg:inline">设置</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  const mobileNavItems = [
    { href: '/', label: '首页', emoji: '🏠' },
    { href: '/feeding', label: '饮食', emoji: '🍼' },
    { href: '/sleep', label: '睡眠', emoji: '😴' },
    { href: '/growth', label: '生长', emoji: '📏' },
    { href: '/health', label: '健康', emoji: '🏥' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t-2 border-pink-100 z-40 safe-area-pb">
      <div className="flex justify-around py-2 px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all
                ${isActive
                  ? 'bg-pink-50 text-pink-500'
                  : 'text-gray-400 hover:text-pink-400'
                }
              `}
            >
              <span className={`text-2xl ${isActive ? 'animate-bounce-soft' : ''}`}>
                {item.emoji}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function PageHeader({ title, emoji, back = false }: { title: string; emoji: string; back?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {back && (
        <button
          onClick={() => window.history.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-pink-50 hover:bg-pink-100 text-pink-500 transition-colors"
        >
          ←
        </button>
      )}
      <span className="text-4xl animate-bounce-soft">{emoji}</span>
      <div>
        <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
      </div>
    </div>
  );
}
