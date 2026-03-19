'use client';

import React, { useState, useEffect } from 'react';
import { useHealthStore } from '@/stores';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, TextArea, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/Header';
import { HEALTH_TYPES } from '@/types';
import { format } from 'date-fns';

export default function HealthPage() {
  const { records, loading, fetchRecords, addRecord, deleteRecord } = useHealthStore();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [type, setType] = useState<string>('checkup');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [notes, setNotes] = useState('');

  const checkups = records.filter(r => r.type === 'checkup');
  const vaccines = records.filter(r => r.type === 'vaccine');
  const medicines = records.filter(r => r.type === 'medicine');

  const handleSubmit = () => {
    if (!title) return;
    addRecord({
      date,
      type: type as 'checkup' | 'vaccine' | 'medicine',
      title,
      details: details || title,
      nextDate: nextDate || undefined,
      notes: notes || undefined,
    });
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setType('checkup');
    setTitle('');
    setDetails('');
    setNextDate('');
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
      <PageHeader title="健康观察" emoji="🏥" />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 rounded-2xl p-4 text-center border-2 border-blue-200">
          <div className="text-2xl mb-1">🏥</div>
          <div className="text-xl font-bold text-gray-700">{checkups.length}</div>
          <div className="text-xs text-gray-500">体检</div>
        </div>
        <div className="bg-green-50 rounded-2xl p-4 text-center border-2 border-green-200">
          <div className="text-2xl mb-1">💉</div>
          <div className="text-xl font-bold text-gray-700">{vaccines.length}</div>
          <div className="text-xs text-gray-500">疫苗</div>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 text-center border-2 border-orange-200">
          <div className="text-2xl mb-1">💊</div>
          <div className="text-xl font-bold text-gray-700">{medicines.length}</div>
          <div className="text-xs text-gray-500">用药</div>
        </div>
      </div>

      <Button onClick={() => setIsModalOpen(true)} fullWidth className="mb-6">
        <span>➕</span> 添加记录
      </Button>

      {/* Records by Type */}
      {(['checkup', 'vaccine', 'medicine'] as const).map((recordType) => {
        const typeRecords = records.filter(r => r.type === recordType);
        const typeInfo = HEALTH_TYPES[recordType];
        if (typeRecords.length === 0) return null;

        return (
          <Card key={recordType} className="mb-4">
            <CardHeader emoji={typeInfo.emoji} title={typeInfo.label} subtitle={`${typeRecords.length} 条记录`} />
            <div className="space-y-3">
              {typeRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-700">{record.title}</div>
                    <div className="text-sm text-gray-400">
                      {record.date}
                      {record.nextDate && <span className="ml-2 text-pink-500">下次: {record.nextDate}</span>}
                    </div>
                    {record.notes && <div className="text-xs text-gray-400 mt-1">{record.notes}</div>}
                  </div>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-2"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}

      {records.length === 0 && (
        <Card>
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">🏥</div>
            <p>还没有健康记录哦</p>
          </div>
        </Card>
      )}

      {/* Add Record Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title="添加健康记录"
      >
        <div className="space-y-4">
          <Select
            label="记录类型"
            value={type}
            onChange={setType}
            options={Object.entries(HEALTH_TYPES).map(([key, val]) => ({
              value: key,
              label: `${val.emoji} ${val.label}`,
            }))}
          />
          <Input
            label="日期"
            type="date"
            value={date}
            onChange={setDate}
            required
          />
          <Input
            label="标题"
            value={title}
            onChange={setTitle}
            placeholder={type === 'vaccine' ? '例: 乙肝疫苗第二针' : type === 'checkup' ? '例: 6月龄体检' : '例: 感冒用药'}
            required
          />
          <TextArea
            label="详情"
            value={details}
            onChange={setDetails}
            placeholder="详细记录..."
          />
          <Input
            label="下次日期"
            type="date"
            value={nextDate}
            onChange={setNextDate}
            placeholder="可选"
          />
          <TextArea
            label="备注"
            value={notes}
            onChange={setNotes}
            placeholder="其他备注..."
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
