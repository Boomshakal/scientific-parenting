'use client';

import React, { useState, useEffect } from 'react';
import { useSleepStore } from '@/stores';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, TextArea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/Header';
import { format } from 'date-fns';

const qualityOptions = [
  { value: 'good', label: '😊 睡得好', color: 'bg-green-100 text-green-600' },
  { value: 'normal', label: '😐 一般', color: 'bg-yellow-100 text-yellow-600' },
  { value: 'bad', label: '😴 睡得差', color: 'bg-red-100 text-red-600' },
];

export default function SleepPage() {
  const { records, loading, fetchRecords, addRecord, deleteRecord } = useSleepStore();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('20:00');
  const [endTime, setEndTime] = useState('');
  const [quality, setQuality] = useState<string>('good');
  const [notes, setNotes] = useState('');

  const todayRecords = records.filter(r => r.date === format(new Date(), 'yyyy-MM-dd'));
  const totalSleepToday = todayRecords.reduce((sum, r) => sum + r.duration, 0);

  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const start = startH * 60 + startM;
    let end = endH * 60 + endM;
    if (end < start) end += 24 * 60; // 跨天
    return end - start;
  };

  const handleSubmit = () => {
    const duration = calculateDuration();
    addRecord({
      date,
      startTime,
      endTime: endTime || startTime,
      duration,
      quality: quality as 'good' | 'normal' | 'bad',
      notes: notes || undefined,
    });
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setStartTime('20:00');
    setEndTime('');
    setQuality('good');
    setNotes('');
  };

  const getQualityInfo = (q: string) => qualityOptions.find(opt => opt.value === q) || qualityOptions[0];

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}小时${m}分钟`;
    if (h > 0) return `${h}小时`;
    return `${m}分钟`;
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
      <PageHeader title="睡眠记录" emoji="😴" />

      {/* Today's Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-50 rounded-2xl p-4 text-center border-2 border-blue-200">
          <div className="text-2xl mb-1">🌙</div>
          <div className="text-xl font-bold text-gray-700">{formatDuration(totalSleepToday)}</div>
          <div className="text-xs text-gray-500">今日睡眠</div>
        </div>
        <div className="bg-purple-50 rounded-2xl p-4 text-center border-2 border-purple-200">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-xl font-bold text-gray-700">{todayRecords.length}</div>
          <div className="text-xs text-gray-500">睡眠次数</div>
        </div>
      </div>

      <Button onClick={() => setIsModalOpen(true)} fullWidth className="mb-6">
        <span>➕</span> 记录睡眠
      </Button>

      {/* Records List */}
      <Card>
        <CardHeader emoji="📋" title="睡眠记录" />
        {records.length > 0 ? (
          <div className="space-y-3">
            {records.slice(0, 20).map((record) => {
              const qualityInfo = getQualityInfo(record.quality);
              return (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">😴</span>
                    <div>
                      <div className="font-semibold text-gray-700">
                        {record.startTime} - {record.endTime}
                        <span className="ml-2 text-pink-500">({formatDuration(record.duration)})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${qualityInfo.color}`}>
                          {qualityInfo.label}
                        </span>
                        <span className="text-xs text-gray-400">{record.date}</span>
                      </div>
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
            <div className="text-4xl mb-2">😴</div>
            <p>还没有记录哦</p>
          </div>
        )}
      </Card>

      {/* Add Record Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title="记录睡眠"
      >
        <div className="space-y-4">
          <Input
            label="日期"
            type="date"
            value={date}
            onChange={setDate}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="入睡时间"
              type="time"
              value={startTime}
              onChange={setStartTime}
              required
            />
            <Input
              label="醒来时间"
              type="time"
              value={endTime}
              onChange={setEndTime}
              placeholder="可选"
            />
          </div>
          <Select
            label="睡眠质量"
            value={quality}
            onChange={setQuality}
            options={qualityOptions.map(opt => ({ value: opt.value, label: opt.label }))}
          />
          <TextArea
            label="备注"
            value={notes}
            onChange={setNotes}
            placeholder="睡得怎么样..."
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
