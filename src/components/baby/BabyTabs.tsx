'use client';

import React, { useState, useEffect } from 'react';
import { useBabyStore } from '@/stores';

interface BabyTabsProps {
  onChange?: (babyId: string) => void;
}

export function BabyTabs({ onChange }: BabyTabsProps) {
  const { babies, currentBabyId, setCurrentBaby, fetchBabies } = useBabyStore();
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (babies.length === 0) {
      setLoading(true);
      fetchBabies().finally(() => setLoading(false));
    }
  }, [babies.length, fetchBabies]);

  const handleSelect = (babyId: string) => {
    setCurrentBaby(babyId);
    onChange?.(babyId);
  };

  const handleCreateNew = async () => {
    try {
      // Create a new baby via POST /api/babies with default values
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const res = await fetch('/api/babies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: '宝宝',
          birthday: today,
          gender: 'unknown',
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to create baby');
      }

      const newBaby = await res.json();
      // Refresh the list and select the new baby
      await fetchBabies();
      await setCurrentBaby(newBaby.id);
      onChange?.(newBaby.id);
    } catch (error) {
      console.error('Create baby failed:', error);
      alert('创建宝宝失败，请重试');
    }
  };

  const handleDelete = async (babyId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent tab selection

    if (babies.length <= 1) {
      alert('至少需要保留一个宝宝记录');
      return;
    }

    if (!confirm('确定要删除这个宝宝吗？此操作不可撤销。')) {
      return;
    }

    setDeletingId(babyId);
    try {
      const res = await fetch(`/api/babies/${babyId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.error || 'Failed to delete baby');
      }

      // Refresh the list
      await fetchBabies();

      // If we deleted the current baby, switch to another one
      if (babyId === currentBabyId) {
        // Find a remaining baby (preferably the first one)
        const { babies: updatedBabies } = useBabyStore.getState();
        if (updatedBabies.length > 0) {
          await setCurrentBaby(updatedBabies[0].id);
          onChange?.(updatedBabies[0].id);
        }
      }
    } catch (error) {
      console.error('Delete baby failed:', error);
      alert('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-200 border-t-pink-500"></div>
        加载中...
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {babies.map((baby) => (
        <div
          key={baby.id}
          className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all border-2 ${
            currentBabyId === baby.id
              ? 'bg-pink-100 border-pink-400 text-pink-700 shadow-sm'
              : 'bg-white border-gray-200 hover:border-pink-200 text-gray-600'
          }`}
        >
          {/* Active indicator */}
          {currentBabyId === baby.id && (
            <span className="w-2 h-2 bg-pink-500 rounded-full shadow-sm flex-shrink-0"></span>
          )}

          <button
            onClick={() => handleSelect(baby.id)}
            className="flex items-center gap-2 flex-1 text-left"
          >
            <span className="text-lg">{baby.avatar || '👶'}</span>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">{baby.name}</span>
              <span className="text-xs opacity-60">
                {baby.gender === 'male' ? '男孩' : baby.gender === 'female' ? '女孩' : '未知'}
              </span>
            </div>
          </button>

          {/* Delete button */}
          <button
            onClick={(e) => handleDelete(baby.id, e)}
            disabled={deletingId === baby.id}
            title="删除宝宝"
            className={`w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white text-xs hover:bg-red-600 transition-opacity ${
              babies.length <= 1 ? 'hidden' : 'opacity-0 group-hover:opacity-100'
            } ${deletingId === baby.id ? 'opacity-100' : ''}`}
          >
            {deletingId === baby.id ? (
              <span className="animate-spin">⟳</span>
            ) : (
              '✕'
            )}
          </button>
        </div>
      ))}
      <button
        onClick={handleCreateNew}
        className="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all border-2 border-dashed border-gray-300 hover:border-pink-300 hover:bg-pink-50 text-gray-500"
      >
        <span className="text-lg">➕</span>
        <span className="text-sm font-medium">新增</span>
      </button>
    </div>
  );
}
