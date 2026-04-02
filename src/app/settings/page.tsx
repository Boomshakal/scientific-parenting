'use client';

import React, { useState, useEffect } from 'react';
import { useBabyStore } from '@/stores';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/Header';
import { signOut } from 'next-auth/react';

const avatars = [
  { emoji: '👦', label: '男孩1' },
  { emoji: '👧', label: '女孩1' },
  { emoji: '👶', label: '宝宝' },
  { emoji: '🧒', label: '小孩' },
  { emoji: '👼', label: '天使' },
  { emoji: '🧸', label: '小熊' },
];

export default function SettingsPage() {
  const { baby, loading, fetchBaby, setBaby } = useBabyStore();
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [avatar, setAvatar] = useState('👶');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchBaby();
  }, [fetchBaby]);

  useEffect(() => {
    if (baby) {
      setName(baby.name || '');
      setBirthday(baby.birthday || '');
      setGender(baby.gender || 'male');
      setAvatar(baby.avatar || '👶');
    }
  }, [baby]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('请输入宝宝姓名');
      return;
    }
    if (!birthday) {
      alert('请选择出生日期');
      return;
    }

    setSaving(true);
    try {
      await setBaby({
        name: name.trim(),
        birthday,
        gender,
        avatar,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Save failed:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce-soft">⏳</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <PageHeader title="宝宝设置" emoji="⚙️" back />

      {/* Avatar Section */}
      <div className="bg-white rounded-3xl p-6 mb-6 border-2 border-pink-100 shadow-lg">
        <div className="flex flex-col items-center">
          <div className="text-7xl mb-4 animate-float">{avatar}</div>
          <div className="grid grid-cols-6 gap-2">
            {avatars.map((a) => (
              <button
                key={a.emoji}
                onClick={() => setAvatar(a.emoji)}
                className={`text-2xl p-2 rounded-xl transition-all ${
                  avatar === a.emoji
                    ? 'bg-pink-100 scale-110 border-2 border-pink-400'
                    : 'bg-gray-50 hover:bg-pink-50 border-2 border-transparent'
                }`}
                title={a.label}
              >
                {a.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-3xl p-6 mb-6 border-2 border-pink-100 shadow-lg space-y-6">
        <Input
          label="宝宝姓名"
          value={name}
          onChange={setName}
          placeholder="请输入宝宝姓名"
          required
        />

        <Input
          label="出生日期"
          type="date"
          value={birthday}
          onChange={setBirthday}
          required
        />

        <div>
          <label className="text-sm font-semibold text-gray-600 pl-2 block mb-3">
            性别 <span className="text-pink-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setGender('male')}
              className={`p-4 rounded-2xl border-2 transition-all text-center ${
                gender === 'male'
                  ? 'bg-blue-50 border-blue-400 scale-105'
                  : 'bg-gray-50 border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="text-3xl mb-2">👦</div>
              <div className="font-semibold text-gray-700">男孩</div>
            </button>
            <button
              onClick={() => setGender('female')}
              className={`p-4 rounded-2xl border-2 transition-all text-center ${
                gender === 'female'
                  ? 'bg-pink-50 border-pink-400 scale-105'
                  : 'bg-gray-50 border-gray-200 hover:border-pink-200'
              }`}
            >
              <div className="text-3xl mb-2">👧</div>
              <div className="font-semibold text-gray-700">女孩</div>
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        fullWidth
        size="lg"
        disabled={saving}
        className={saved ? 'bg-green-500 hover:bg-green-500' : ''}
      >
        {saving ? '保存中...' : saved ? '✅ 保存成功' : '💾 保存设置'}
      </Button>

      {/* Tips */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="text-sm text-gray-600">
            <p className="font-semibold mb-1">温馨提示</p>
            <p>设置宝宝信息后，首页将显示宝宝的年龄和相关信息。出生日期用于计算月龄。</p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="mt-8">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full py-3 px-6 rounded-2xl border-2 border-red-200 text-red-500 font-semibold hover:bg-red-50 hover:border-red-300 transition-all"
        >
          🚪 退出登录
        </button>
      </div>
    </div>
  );
}
