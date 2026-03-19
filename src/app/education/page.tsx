'use client';

import React, { useState, useEffect } from 'react';
import { useEducationStore } from '@/stores';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, TextArea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/Header';
import { EDUCATION_TYPES } from '@/types';
import { format } from 'date-fns';

export default function EducationPage() {
  const { records, loading, fetchRecords, addRecord, deleteRecord } = useEducationStore();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [type, setType] = useState<string>('reading');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  const todayRecords = records.filter(r => r.date === format(new Date(), 'yyyy-MM-dd'));
  const totalMinutesToday = todayRecords.reduce((sum, r) => sum + r.duration, 0);

  const handleSubmit = () => {
    if (!duration) return;
    addRecord({
      date,
      time,
      type: type as 'reading' | 'game' | 'outdoor' | 'music' | 'art',
      duration: parseInt(duration),
      description: description || undefined,
    });
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime(format(new Date(), 'HH:mm'));
    setType('reading');
    setDuration('');
    setDescription('');
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
      <PageHeader title="早教活动" emoji="📚" />

      {/* Today's Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 rounded-2xl p-4 text-center border-2 border-blue-200">
          <div className="text-2xl mb-1">⏱️</div>
          <div className="text-xl font-bold text-gray-700">{totalMinutesToday}m</div>
          <div className="text-xs text-gray-500">今日时长</div>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center border-2 border-green-200">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-xl font-bold text-gray-700">{todayRecords.length}</div>
          <div className="text-xs text-gray-500">活动次数</div>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 text-center border-2 border-purple-200">
          <div className="text-2xl mb-1">📚</div>
          <div className="text-xl font-bold text-gray-700">{todayRecords.filter(r => r.type === 'reading').length}</div>
          <div className="text-xs text-gray-500">阅读次数</div>
        </div>
      </div>

      <Button onClick={() => setIsModalOpen(true)} fullWidth className="mb-6">
        <span>➕</span> 记录活动
      </Button>

      {/* Records List */}
      <Card>
        <CardHeader emoji="📋" title="活动记录" />
        {records.length > 0 ? (
          <div className="space-y-3">
            {records.slice(0, 20).map((record) => {
              const typeInfo = EDUCATION_TYPES[record.type];
              return (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{typeInfo.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-700">
                        {typeInfo.label}
                        <span className="ml-2 text-pink-500">{record.duration}分钟</span>
                      </div>
                      <div className="text-sm text-gray-400">{record.date} {record.time}</div>
                      {record.description && <div className="text-xs text-gray-400 mt-1">{record.description}</div>}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-2"
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📚</div>
            <p>还没有记录哦</p>
          </div>
        )}
      </Card>

      {/* Add Record Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title="记录早教活动"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="日期"
              type="date"
              value={date}
              onChange={setDate}
              required
            />
            <Input
              label="时间"
              type="time"
              value={time}
              onChange={setTime}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 pl-2 block mb-3">活动类型</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(EDUCATION_TYPES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setType(key)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    type === key
                      ? 'border-pink-400 bg-pink-50 scale-105'
                      : 'border-gray-100 hover:border-pink-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{val.emoji}</div>
                  <div className="text-xs text-gray-600">{val.label}</div>
                </button>
              ))}
            </div>
          </div>
          <Input
            label="时长 (分钟)"
            type="number"
            value={duration}
            onChange={setDuration}
            placeholder="例: 30"
            required
          />
          <TextArea
            label="活动内容"
            value={description}
            onChange={setDescription}
            placeholder="做了什么..."
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
