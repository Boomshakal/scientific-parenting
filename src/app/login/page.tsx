'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('邮箱或密码错误，请重试');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async () => {
    setIsOAuthLoading(true);
    try {
      await signIn('authentik', { callbackUrl: '/' });
    } catch {
      setError('SSO 登录失败，请稍后重试');
      setIsOAuthLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">👶</div>
          <h1 className="text-2xl font-bold text-gray-700">欢迎回来</h1>
          <p className="text-gray-400 mt-2">登录科学育儿应用</p>
        </div>

        <div className="card-baby p-6 md:p-8">
          {error && (
            <div className="alert alert-error mb-6 rounded-xl" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="label-text font-medium text-gray-600">
                  📧 邮箱地址
                </span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                className="input-baby w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="password">
                <span className="label-text font-medium text-gray-600">
                  🔒 密码
                </span>
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="input-baby w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn-baby w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white py-3 px-6 font-semibold hover:from-pink-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading || isOAuthLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>登录中...</span>
                </>
              ) : (
                '登录'
              )}
            </button>
          </form>

          <div className="divider text-gray-300 my-6">或</div>

          <button
            onClick={handleOAuthLogin}
            className="btn-baby w-full bg-white border-2 border-pink-200 text-gray-600 py-3 px-6 font-semibold hover:bg-pink-50 hover:border-pink-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={isLoading || isOAuthLoading}
          >
            {isOAuthLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                <span>跳转中...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <span>使用 Authentik 登录</span>
              </>
            )}
          </button>

          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              还没有账号？{' '}
              <Link
                href="/register"
                className="text-pink-500 font-semibold hover:text-pink-600 hover:underline"
              >
                立即注册
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          🍼 科学育儿 · 记录成长每一刻
        </p>
      </div>
    </div>
  );
}
