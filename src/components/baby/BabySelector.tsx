'use client';

import React, { useState, useEffect } from 'react';
import { useBabyStore } from '@/stores';
import { Button } from '../ui/Button';

export function BabySelector() {
  const { babies, currentBabyId, setCurrentBaby, fetchBabies } = useBabyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 确保宝宝列表已加载
    if (babies.length === 0) {
      setLoading(true);
      fetchBabies().finally(() => setLoading(false));
    }
  }, [babies.length, fetchBabies]);

  const currentBaby = babies.find(b => b.id === currentBabyId) || babies[0];

  const handleSelect = (babyId: string) => {
    setCurrentBaby(babyId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || babies.length === 0}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 transition-all border-2 border-transparent hover:border-pink-200 disabled:opacity-50"
      >
        <span className="text-2xl">{currentBaby?.avatar || '👶'}</span>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-semibold text-gray-700">
            {currentBaby?.name || '加载中...'}
          </div>
          <div className="text-xs text-gray-400">
            {babies.length > 1 ? `(${babies.length}个宝宝)` : ''}
          </div>
        </div>
        <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border-2 border-pink-100 z-20 max-h-80 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-400 px-2 py-1">
                选择宝宝 ({babies.length})
              </div>
              {babies.map((baby) => (
                <button
                  key={baby.id}
                  onClick={() => handleSelect(baby.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    baby.id === currentBabyId
                      ? 'bg-pink-100 border-2 border-pink-300'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{baby.avatar || '👶'}</span>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-700">
                      {baby.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {baby.gender === 'male' ? '男孩' : baby.gender === 'female' ? '女孩' : '未知'}
                      {baby.birthday && ` · ${new Date(baby.birthday).toLocaleDateString('zh-CN')}`}
                    </div>
                  </div>
                  {baby.id === currentBabyId && (
                    <span className="text-pink-500">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
