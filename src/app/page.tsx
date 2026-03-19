'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useBabyStore, useFeedingStore, useSleepStore, useGrowthStore, useMilestoneStore, useEducationStore } from '@/stores';
import { StatCard, Card, CardHeader } from '@/components/ui/Card';
import { MILESTONE_TYPES } from '@/types';
import { format } from 'date-fns';

const quickActions = [
  { href: '/feeding', emoji: '🍼', label: '喂养', color: 'bg-orange-100' },
  { href: '/sleep', emoji: '😴', label: '睡眠', color: 'bg-blue-100' },
  { href: '/growth', emoji: '📏', label: '测量', color: 'bg-pink-100' },
  { href: '/mood', emoji: '😊', label: '情绪', color: 'bg-yellow-100' },
  { href: '/education', emoji: '📚', label: '早教', color: 'bg-purple-100' },
  { href: '/milestone', emoji: '🎉', label: '里程碑', color: 'bg-green-100' },
];

export default function HomePage() {
  const { baby, loading: babyLoading, fetchBaby } = useBabyStore();
  const { records: feedingRecords, loading: feedingLoading, fetchRecords: fetchFeeding } = useFeedingStore();
  const { records: sleepRecords, loading: sleepLoading, fetchRecords: fetchSleep } = useSleepStore();
  const { records: growthRecords, loading: growthLoading, fetchRecords: fetchGrowth } = useGrowthStore();
  const { milestones, loading: milestoneLoading, fetchMilestones } = useMilestoneStore();
  const { records: educationRecords, loading: educationLoading, fetchRecords: fetchEducation } = useEducationStore();

  const loading = babyLoading || feedingLoading || sleepLoading || growthLoading || milestoneLoading || educationLoading;

  useEffect(() => {
    fetchBaby();
    fetchFeeding();
    fetchSleep();
    fetchGrowth();
    fetchMilestones();
    fetchEducation();
  }, [fetchBaby, fetchFeeding, fetchSleep, fetchGrowth, fetchMilestones, fetchEducation]);

  const today = format(new Date(), 'yyyy-MM-dd');

  const todayFeedings = feedingRecords.filter(r => r.date === today);
  const todaySleeps = sleepRecords.filter(r => r.date === today);
  const todayEducation = educationRecords.filter(r => r.date === today);

  const totalSleepToday = todaySleeps.reduce((sum, r) => sum + r.duration, 0);
  const totalEducationToday = todayEducation.reduce((sum, r) => sum + r.duration, 0);

  const latestGrowth = growthRecords[0];

  const getAge = () => {
    if (!baby?.birthday) return '';
    const birthDate = new Date(baby.birthday);
    const now = new Date();
    const months = (now.getFullYear() - birthDate.getFullYear()) * 12 + now.getMonth() - birthDate.getMonth();
    if (months < 1) {
      const days = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
      return `${days}天`;
    }
    return `${months}个月`;
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-pink-400 via-pink-300 to-orange-300 rounded-3xl p-6 text-white shadow-lg shadow-pink-200 relative">
        <Link
          href="/settings"
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
        >
          ⚙️
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-5xl animate-float">
            {baby?.avatar || (baby?.gender === 'male' ? '👦' : '👧')}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {baby?.name} 👋
            </h1>
            <p className="text-pink-100">
              {getAge()} · {format(new Date(), 'MM月dd日')}
            </p>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div>
        <h2 className="text-lg font-bold text-gray-600 mb-3 pl-2">📊 今日概览</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            emoji="🍼"
            value={todayFeedings.length}
            label="喂养次数"
            color="orange"
          />
          <StatCard
            emoji="😴"
            value={`${Math.floor(totalSleepToday / 60)}h${totalSleepToday % 60}m`}
            label="睡眠时长"
            color="blue"
          />
          <StatCard
            emoji="📏"
            value={latestGrowth ? `${latestGrowth.weight}kg` : '无'}
            label="最新体重"
            color="pink"
          />
          <StatCard
            emoji="📚"
            value={`${totalEducationToday}m`}
            label="早教时间"
            color="purple"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-600 mb-3 pl-2">⚡ 快捷记录</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`${action.color} rounded-2xl p-4 text-center transition-all hover:scale-105 hover:shadow-lg border-2 border-transparent hover:border-pink-200`}
            >
              <div className="text-3xl mb-2">{action.emoji}</div>
              <div className="text-sm font-semibold text-gray-600">{action.label}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Milestones */}
      <Card>
        <CardHeader emoji="🎉" title="最近里程碑" subtitle="记录每一个成长瞬间" />
        {milestones.length > 0 ? (
          <div className="space-y-3">
            {milestones.slice(0, 3).map((milestone) => {
              const type = MILESTONE_TYPES.find(t => t.key === milestone.type);
              return (
                <div key={milestone.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <span className="text-2xl">{type?.emoji || '⭐'}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700">{type?.label || milestone.type}</div>
                    <div className="text-sm text-gray-400">{milestone.achievedDate}</div>
                  </div>
                </div>
              );
            })}
            <Link href="/milestone" className="block text-center text-pink-500 text-sm font-medium hover:text-pink-600 mt-2">
              查看全部 →
            </Link>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🌟</div>
            <p>还没有记录里程碑哦</p>
            <Link href="/milestone" className="text-pink-500 text-sm font-medium hover:text-pink-600 mt-2 inline-block">
              去记录第一个里程碑 →
            </Link>
          </div>
        )}
      </Card>

      {/* Module Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Link href="/growth" className="card-baby p-4 flex flex-col items-center gap-2 hover:shadow-xl transition-all">
          <span className="text-3xl">📏</span>
          <span className="font-semibold text-gray-600">生长发育</span>
          <span className="text-xs text-gray-400">{growthRecords.length} 条记录</span>
        </Link>
        <Link href="/feeding" className="card-baby p-4 flex flex-col items-center gap-2 hover:shadow-xl transition-all">
          <span className="text-3xl">🍼</span>
          <span className="font-semibold text-gray-600">饮食记录</span>
          <span className="text-xs text-gray-400">{feedingRecords.length} 条记录</span>
        </Link>
        <Link href="/sleep" className="card-baby p-4 flex flex-col items-center gap-2 hover:shadow-xl transition-all">
          <span className="text-3xl">😴</span>
          <span className="font-semibold text-gray-600">睡眠记录</span>
          <span className="text-xs text-gray-400">{sleepRecords.length} 条记录</span>
        </Link>
        <Link href="/health" className="card-baby p-4 flex flex-col items-center gap-2 hover:shadow-xl transition-all">
          <span className="text-3xl">🏥</span>
          <span className="font-semibold text-gray-600">健康观察</span>
          <span className="text-xs text-gray-400">就医疫苗用药</span>
        </Link>
      </div>
    </div>
  );
}
