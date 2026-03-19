'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  return (
    <div
      className={`card-baby p-6 ${hover ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  emoji: string;
  title: string;
  subtitle?: string;
}

export function CardHeader({ emoji, title, subtitle }: CardHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-3xl animate-bounce-soft">{emoji}</span>
      <div>
        <h3 className="text-lg font-bold text-gray-700">{title}</h3>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}

interface StatCardProps {
  emoji: string;
  value: string | number;
  label: string;
  color?: 'pink' | 'blue' | 'green' | 'orange' | 'purple' | 'yellow';
}

export function StatCard({ emoji, value, label, color = 'pink' }: StatCardProps) {
  const colorClasses = {
    pink: 'bg-pink-50 border-pink-200',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-100 border-green-300',
    orange: 'bg-orange-100 border-orange-300',
    purple: 'bg-purple-100 border-purple-300',
    yellow: 'bg-yellow-100 border-yellow-300',
  };

  return (
    <div className={`${colorClasses[color]} border-2 rounded-2xl p-4 text-center transition-all hover:scale-105`}>
      <div className="text-3xl mb-2">{emoji}</div>
      <div className="text-2xl font-bold text-gray-700">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
