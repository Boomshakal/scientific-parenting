'use client';

import React, { useState, useEffect } from 'react';
import { useMilestoneStore } from '@/stores';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TextArea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/Header';
import { MILESTONE_TYPES } from '@/types';
import { format } from 'date-fns';

export default function MilestonePage() {
  const { milestones, loading, fetchMilestones, addMilestone, deleteMilestone } = useMilestoneStore();

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(MILESTONE_TYPES[0].key);
  const [achievedDate, setAchievedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [notes, setNotes] = useState('');

  const achievedTypes = new Set(milestones.map(m => m.type));

  const handleSubmit = () => {
    addMilestone({
      type: selectedType,
      achievedDate,
      notes: notes || undefined,
    });
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedType(MILESTONE_TYPES[0].key);
    setAchievedDate(format(new Date(), 'yyyy-MM-dd'));
    setNotes('');
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
    <div>
      <PageHeader title="里程碑时刻" emoji="🎉" />

      <Button onClick={() => setIsModalOpen(true)} fullWidth className="mb-6">
        <span>➕</span> 记录里程碑
      </Button>

      {/* Achieved Milestones */}
      {milestones.length > 0 && (
        <Card className="mb-6">
          <CardHeader emoji="🏆" title="已达成" subtitle={`共 ${milestones.length} 个里程碑`} />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {milestones.map((milestone) => {
              const type = MILESTONE_TYPES.find(t => t.key === milestone.type);
              return (
                <div key={milestone.id} className="bg-green-50 rounded-2xl p-4 text-center border-2 border-green-200 relative group">
                  <button
                    onClick={() => deleteMilestone(milestone.id)}
                    className="absolute top-2 right-2 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                  <div className="text-3xl mb-2">{type?.emoji || '⭐'}</div>
                  <div className="font-semibold text-gray-700 text-sm">{type?.label || milestone.type}</div>
                  <div className="text-xs text-gray-400 mt-1">{milestone.achievedDate}</div>
                  {milestone.notes && (
                    <div className="text-xs text-gray-400 mt-1 truncate">{milestone.notes}</div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* All Milestones */}
      <Card>
        <CardHeader emoji="📋" title="成长里程碑" subtitle="看看宝宝学会了哪些本领" />
        <div className="space-y-2">
          {MILESTONE_TYPES.map((type) => {
            const isAchieved = achievedTypes.has(type.key);
            const milestone = milestones.find(m => m.type === type.key);
            return (
              <div
                key={type.key}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  isAchieved
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <span className={`text-2xl ${isAchieved ? '' : 'grayscale opacity-50'}`}>
                  {type.emoji}
                </span>
                <div className="flex-1">
                  <div className={`font-semibold ${isAchieved ? 'text-gray-700' : 'text-gray-400'}`}>
                    {type.label}
                  </div>
                  <div className="text-xs text-gray-400">
                    {isAchieved
                      ? `✓ ${milestone?.achievedDate}`
                      : `参考: 约 ${type.month} 个月`
                    }
                  </div>
                </div>
                {isAchieved && (
                  <span className="text-green-500 text-xl">✅</span>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Add Milestone Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title="记录里程碑"
      >
        <div className="space-y-4">
          <Select
            label="里程碑类型"
            value={selectedType}
            onChange={setSelectedType}
            options={MILESTONE_TYPES.map(t => ({
              value: t.key,
              label: `${t.emoji} ${t.label}`,
            }))}
          />
          <div>
            <label className="text-sm font-semibold text-gray-600 pl-2 block mb-2">达成日期 *</label>
            <input
              type="date"
              value={achievedDate}
              onChange={(e) => setAchievedDate(e.target.value)}
              className="input-baby w-full"
            />
          </div>
          <TextArea
            label="记录这一刻"
            value={notes}
            onChange={setNotes}
            placeholder="宝宝第一次..."
          />
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => { setIsModalOpen(false); resetForm(); }} fullWidth>取消</Button>
            <Button onClick={handleSubmit} fullWidth>保存</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
