'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useGrowthStore } from '@/stores';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, TextArea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/Header';
import { format } from 'date-fns';

export default function GrowthPage() {
  const { records, loading, fetchRecords, addRecord, deleteRecord } = useGrowthStore();

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [headCirc, setHeadCirc] = useState('');
  const [notes, setNotes] = useState('');

  const openModal = useCallback(() => {
    console.log('Opening modal...');
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setHeight('');
    setWeight('');
    setHeadCirc('');
    setNotes('');
  }, []);

  const handleSubmit = useCallback(() => {
    console.log('Submitting...', { height, weight, headCirc });
    if (!height || !weight || !headCirc) {
      alert('请填写身高、体重和头围');
      return;
    }
    addRecord({
      date,
      height: parseFloat(height),
      weight: parseFloat(weight),
      headCirc: parseFloat(headCirc),
      notes: notes || undefined,
    });
    closeModal();
  }, [date, height, weight, headCirc, notes, addRecord, closeModal]);

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
      <PageHeader title="生长发育" emoji="📏" />

      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-pink-50 rounded-2xl p-4 text-center border-2 border-pink-200">
            <div className="text-2xl mb-1">📏</div>
            <div className="text-xl font-bold text-gray-700">{records[0].height}cm</div>
            <div className="text-xs text-gray-500">最新身高</div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-4 text-center border-2 border-blue-200">
            <div className="text-2xl mb-1">⚖️</div>
            <div className="text-xl font-bold text-gray-700">{records[0].weight}kg</div>
            <div className="text-xs text-gray-500">最新体重</div>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4 text-center border-2 border-purple-200">
            <div className="text-2xl mb-1">🧶</div>
            <div className="text-xl font-bold text-gray-700">{records[0].headCirc}cm</div>
            <div className="text-xs text-gray-500">最新头围</div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <Button onClick={openModal} fullWidth>
          <span>➕</span> 添加记录
        </Button>
      </div>

      <Card>
        <CardHeader emoji="📊" title="历史记录" />
        {records.length > 0 ? (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-xl border border-pink-100">
                <div className="flex-1">
                  <div className="font-semibold text-gray-700 mb-1">{record.date}</div>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>📏 {record.height}cm</span>
                    <span>⚖️ {record.weight}kg</span>
                    <span>🧶 {record.headCirc}cm</span>
                  </div>
                  {record.notes && (
                    <div className="text-xs text-gray-400 mt-1">{record.notes}</div>
                  )}
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
        ) : (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📏</div>
            <p>还没有记录哦</p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="添加生长记录"
      >
        <div className="space-y-4">
          <Input
            label="日期"
            type="date"
            value={date}
            onChange={setDate}
            required
          />
          <Input
            label="身高 (cm)"
            type="number"
            value={height}
            onChange={setHeight}
            placeholder="例: 65.5"
            step={0.1}
            required
          />
          <Input
            label="体重 (kg)"
            type="number"
            value={weight}
            onChange={setWeight}
            placeholder="例: 7.2"
            step={0.01}
            required
          />
          <Input
            label="头围 (cm)"
            type="number"
            value={headCirc}
            onChange={setHeadCirc}
            placeholder="例: 42.5"
            step={0.1}
            required
          />
          <TextArea
            label="备注"
            value={notes}
            onChange={setNotes}
            placeholder="记录一下当时的情况..."
          />
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={closeModal} fullWidth>取消</Button>
            <Button onClick={handleSubmit} fullWidth>保存</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
