'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = '请输入您的姓名';
    } else if (name.length < 2) {
      newErrors.name = '姓名至少需要2个字符';
    }

    if (!email.trim()) {
      newErrors.email = '请输入邮箱地址';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!password) {
      newErrors.password = '请输入密码';
    } else if (password.length < 6) {
      newErrors.password = '密码至少需要6个字符';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || '注册失败，请稍后重试');
        return;
      }

      router.push('/login?registered=true');
    } catch {
      setServerError('注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-float">🎉</div>
          <h1 className="text-2xl font-bold text-gray-700">创建账号</h1>
          <p className="text-gray-400 mt-2">加入科学育儿大家庭</p>
        </div>

        <div className="card-baby p-6 md:p-8">
          {serverError && (
            <div className="alert alert-error mb-6 rounded-xl" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label" htmlFor="name">
                <span className="label-text font-medium text-gray-600">
                  👤 姓名
                </span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="您的姓名"
                className={`input-baby w-full ${errors.name ? 'border-red-300 focus:border-red-400' : ''}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <label className="label" id="name-error">
                  <span className="label-text-alt text-error">{errors.name}</span>
                </label>
              )}
            </div>

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
                className={`input-baby w-full ${errors.email ? 'border-red-300 focus:border-red-400' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <label className="label" id="email-error">
                  <span className="label-text-alt text-error">{errors.email}</span>
                </label>
              )}
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
                placeholder="至少6个字符"
                className={`input-baby w-full ${errors.password ? 'border-red-300 focus:border-red-400' : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <label className="label" id="password-error">
                  <span className="label-text-alt text-error">{errors.password}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label" htmlFor="confirmPassword">
                <span className="label-text font-medium text-gray-600">
                  🔐 确认密码
                </span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="再次输入密码"
                className={`input-baby w-full ${errors.confirmPassword ? 'border-red-300 focus:border-red-400' : ''}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
              />
              {errors.confirmPassword && (
                <label className="label" id="confirm-password-error">
                  <span className="label-text-alt text-error">{errors.confirmPassword}</span>
                </label>
              )}
            </div>

            <button
              type="submit"
              className="btn-baby w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white py-3 px-6 font-semibold hover:from-pink-500 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>注册中...</span>
                </>
              ) : (
                '注册'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              已有账号？{' '}
              <Link
                href="/login"
                className="text-pink-500 font-semibold hover:text-pink-600 hover:underline"
              >
                立即登录
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
