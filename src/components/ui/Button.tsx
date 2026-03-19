'use client';

import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const baseClasses = 'btn-baby font-semibold rounded-2xl transition-all flex items-center justify-center gap-2';

  const variantClasses = {
    primary: 'bg-pink-400 hover:bg-pink-500 text-white shadow-lg shadow-pink-200',
    secondary: 'bg-blue-400 hover:bg-blue-500 text-white shadow-lg shadow-blue-200',
    accent: 'bg-orange-400 hover:bg-orange-500 text-white shadow-lg shadow-orange-200',
    ghost: 'bg-transparent hover:bg-pink-50 text-pink-500',
    outline: 'bg-white border-2 border-pink-300 hover:bg-pink-50 text-pink-500',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
