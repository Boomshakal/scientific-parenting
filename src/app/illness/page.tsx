'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useIllnessStore } from '@/stores/illnessStore';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, TextArea } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/Header';
import { format, parseISO, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { IllnessEpisodeWithStats } from '@/types';

export default function IllnessPage() {
  const { episodes, loading, fetchEpisodes, createEpisode } = useIllnessStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTitle('');
    setStartDate(format(new Date(), 'yyyy-MM-dd'));
    setDescription('');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !startDate) {
      alert('请填写标题和开始日期');
      return;
    }
    try {
      await createEpisode({
        title: title.trim(),
        start_date: startDate,
        description: description.trim() || undefined,
      });
      closeModal();
    } catch (error) {
      // Error already handled by store
    }
  }, [title, startDate, description, createEpisode, closeModal]);

  const renderEpisodeCard = (episode: IllnessEpisodeWithStats) => {
    const start = parseISO(episode.start_date);
    const end = episode.end_date ? parseISO(episode.end_date) : null;
    const duration = end
      ? `${differenceInDays(end, start) + 1}天`
      : `${differenceInDays(new Date(), start) + 1}天（进行中）`;

    return (
      <div
        key={episode.id}
        onClick={() => window.location.href = `/illness/${episode.id}`}
        className="cursor-pointer"
      >
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg text-gray-800">{episode.title}</h3>
              {episode.max_temperature !== undefined && (
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${episode.max_temperature >= 38.5 ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                  🌡️ {episode.max_temperature.toFixed(1)}°C
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <span className="mr-3">📅 {episode.start_date}{end ? ` ~ ${episode.end_date}` : ' 起'}</span>
              <span>⏱️ {duration}</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>📝 {episode.record_count} 条记录</span>
              {episode.description && (
                <span className="truncate flex-1" title={episode.description}>
                📄 {episode.description}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
      <PageHeader title="生病记录" emoji="🤒" />

      <div className="mb-6">
        <Button onClick={openModal} fullWidth>
          <span>➕</span> 新建生病事件
        </Button>
      </div>

      {episodes.length > 0 ? (
        <div className="space-y-4">
          {episodes.map(renderEpisodeCard)}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-4">🤒</div>
            <p>还没有生病记录</p>
            <p className="text-sm mt-2">点击上方按钮开始记录宝宝的生病情况</p>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="新建生病事件"
      >
        <div className="space-y-4">
          <Input
            label="事件标题"
            value={title}
            onChange={setTitle}
            placeholder="例：流感发烧"
            required
          />
          <Input
            label="开始日期"
            type="date"
            value={startDate}
            onChange={setStartDate}
            required
          />
          <TextArea
            label="描述（可选）"
            value={description}
            onChange={setDescription}
            placeholder="简要描述病情或医生诊断..."
          />
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={closeModal} fullWidth>取消</Button>
            <Button onClick={handleSubmit} fullWidth>创建</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
