'use client';

import React, { useState, useEffect } from 'react';
import { useMoodStore } from '@/stores';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, TextArea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/Header';
import { MOOD_TYPES } from '@/types';
import { format } from 'date-fns';

export default function MoodPage() {
  const { records, loading, fetchRecords, addRecord, deleteRecord } = useMoodStore();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [mood, setMood] = useState<string>('happy');
  const [notes, setNotes] = useState('');

  const todayRecords = records.filter(r => r.date === format(new Date(), 'yyyy-MM-dd'));
  const todayMoods = todayRecords.map(r => r.mood);

  const handleSubmit = () => {
    addRecord({
      date,
      time,
      mood: mood as 'happy' | 'calm' | 'fussy' | 'crying',
      notes: notes || undefined,
    });
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime(format(new Date(), 'HH:mm'));
    setMood('happy');
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
      <PageHeader title="情绪行为" emoji="😊" />

      {/* Today's Mood Summary */}
      <Card className="mb-6">
        <CardHeader emoji="🌈" title="今日情绪" />
        <div className="flex flex-wrap gap-3 justify-center">
          {Object.entries(MOOD_TYPES).map(([key, val]) => {
            const count = todayMoods.filter(m => m === key).length;
            return (
              <div
                key={key}
                className={`bg-${val.color}-50 rounded-2xl p-4 text-center border-2 border-${val.color}-200 min-w-[80px]`}
              >
                <div className="text-3xl mb-1">{val.emoji}</div>
                <div className="text-sm font-semibold text-gray-600">{val.label}</div>
                <div className="text-xs text-gray-400">{count} 次</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Button onClick={() => setIsModalOpen(true)} fullWidth className="mb-6">
        <span>➕</span> 记录情绪
      </Button>

      {/* Records List */}
      <Card>
        <CardHeader emoji="📋" title="情绪记录" />
        {records.length > 0 ? (
          <div className="space-y-3">
            {records.slice(0, 20).map((record) => {
              const moodInfo = MOOD_TYPES[record.mood];
              return (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-100">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{moodInfo.emoji}</span>
                    <div>
                      <div className="font-semibold text-gray-700">{moodInfo.label}</div>
                      <div className="text-sm text-gray-400">{record.date} {record.time}</div>
                      {record.notes && <div className="text-xs text-gray-400 mt-1">{record.notes}</div>}
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
            <div className="text-4xl mb-2">😊</div>
            <p>还没有记录哦</p>
          </div>
        )}
      </Card>

      {/* Add Record Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title="记录情绪"
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
            <label className="text-sm font-semibold text-gray-600 pl-2 block mb-3">选择情绪</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(MOOD_TYPES).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setMood(key)}
                  className={`p-3 rounded-xl border-2 transition-all text-center ${
                    mood === key
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
          <TextArea
            label="备注"
            value={notes}
            onChange={setNotes}
            placeholder="发生了什么..."
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
