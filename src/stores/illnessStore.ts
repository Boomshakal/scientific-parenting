import { create } from 'zustand';
import { useToastStore } from './toastStore';
import {
  IllnessEpisode,
  IllnessEpisodeWithStats,
  IllnessEpisodeDetail,
  IllnessRecord,
  Medication,
  DoctorVisit,
} from '@/types';

interface IllnessState {
  episodes: IllnessEpisodeWithStats[];
  currentEpisode: IllnessEpisodeDetail | null;
  loading: boolean;
  error: string | null;
}

interface IllnessActions {
  fetchEpisodes: () => Promise<void>;
  fetchEpisode: (id: string) => Promise<void>;
  createEpisode: (episode: Omit<IllnessEpisode, 'id' | 'created_at' | 'updated_at'>) => Promise<string>;
  updateEpisode: (id: string, updates: Partial<Omit<IllnessEpisode, 'id' | 'created_at'>>) => Promise<void>;
  deleteEpisode: (id: string) => Promise<void>;
  addRecord: (episodeId: string, record: Omit<IllnessRecord, 'id' | 'episode_id'>) => Promise<string>;
  updateRecord: (episodeId: string, recordId: string, updates: Partial<IllnessRecord>) => Promise<void>;
  deleteRecord: (episodeId: string, recordId: string) => Promise<void>;
  addMedication: (episodeId: string, med: Omit<Medication, 'id' | 'episode_id'>) => Promise<string>;
  updateMedication: (episodeId: string, medId: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (episodeId: string, medId: string) => Promise<void>;
  addDoctorVisit: (episodeId: string, visit: Omit<DoctorVisit, 'id' | 'episode_id'>) => Promise<string>;
  updateDoctorVisit: (episodeId: string, visitId: string, updates: Partial<DoctorVisit>) => Promise<void>;
  deleteDoctorVisit: (episodeId: string, visitId: string) => Promise<void>;
  clearCurrentEpisode: () => void;
}

type IllnessStore = IllnessState & IllnessActions;

export const useIllnessStore = create<IllnessStore>((set, get) => ({
  episodes: [],
  currentEpisode: null,
  loading: false,
  error: null,

  fetchEpisodes: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/illness');
      if (!res.ok) throw new Error(`Failed to fetch episodes: ${res.status}`);
      const episodes = await res.json();
      set({ episodes, loading: false });
    } catch (error) {
      console.error('Failed to fetch episodes:', error);
      useToastStore.getState().show('获取记录失败', 'error');
      set({ error: '获取记录失败', loading: false });
    }
  },

  fetchEpisode: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`/api/illness/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          set({ currentEpisode: null, loading: false });
          return;
        }
        throw new Error(`Failed to fetch episode: ${res.status}`);
      }
      const episode = await res.json();
      set({ currentEpisode: episode, loading: false });
    } catch (error) {
      console.error('Failed to fetch episode:', error);
      useToastStore.getState().show('获取详情失败', 'error');
      set({ error: '获取详情失败', loading: false });
    }
  },

  createEpisode: async (episodeData) => {
    try {
      const res = await fetch('/api/illness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(episodeData),
      });
      if (!res.ok) throw new Error(`Failed to create episode: ${res.status}`);
      const episode = await res.json();
      await get().fetchEpisodes();
      useToastStore.getState().show('创建成功', 'success');
      return episode.id;
    } catch (error) {
      console.error('Failed to create episode:', error);
      useToastStore.getState().show('创建失败', 'error');
      throw error;
    }
  },

  updateEpisode: async (id, updates) => {
    try {
      const res = await fetch(`/api/illness/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`Failed to update episode: ${res.status}`);
      await get().fetchEpisodes();
      // Refresh currentEpisode if it's the one being updated
      const { currentEpisode } = get();
      if (currentEpisode?.id === id) {
        await get().fetchEpisode(id);
      }
      useToastStore.getState().show('更新成功', 'success');
    } catch (error) {
      console.error('Failed to update episode:', error);
      useToastStore.getState().show('更新失败', 'error');
      throw error;
    }
  },

  deleteEpisode: async (id) => {
    if (!confirm('确定删除该生病事件？这将同时删除所有关联记录。')) {
      return;
    }
    try {
      const res = await fetch(`/api/illness/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete episode: ${res.status}`);
      await get().fetchEpisodes();
      useToastStore.getState().show('删除成功', 'success');
    } catch (error) {
      console.error('Failed to delete episode:', error);
      useToastStore.getState().show('删除失败', 'error');
      throw error;
    }
  },

  addRecord: async (episodeId, recordData) => {
    try {
      const res = await fetch(`/api/illness/${episodeId}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
      });
      if (!res.ok) throw new Error(`Failed to add record: ${res.status}`);
      const record = await res.json();
      await get().fetchEpisode(episodeId);
      await get().fetchEpisodes(); // to update stats
      useToastStore.getState().show('记录添加成功', 'success');
      return record.id;
    } catch (error) {
      console.error('Failed to add record:', error);
      useToastStore.getState().show('添加记录失败', 'error');
      throw error;
    }
  },

  updateRecord: async (episodeId, recordId, updates) => {
    try {
      const res = await fetch(`/api/illness/${episodeId}/records/${recordId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`Failed to update record: ${res.status}`);
      await get().fetchEpisode(episodeId);
      await get().fetchEpisodes();
      useToastStore.getState().show('记录更新成功', 'success');
    } catch (error) {
      console.error('Failed to update record:', error);
      useToastStore.getState().show('更新记录失败', 'error');
      throw error;
    }
  },

  deleteRecord: async (episodeId, recordId) => {
    try {
      const res = await fetch(`/api/illness/${episodeId}/records/${recordId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Failed to delete record: ${res.status}`);
      await get().fetchEpisode(episodeId);
      await get().fetchEpisodes();
      useToastStore.getState().show('记录已删除', 'success');
    } catch (error) {
      console.error('Failed to delete record:', error);
      useToastStore.getState().show('删除记录失败', 'error');
      throw error;
    }
  },

  addMedication: async (episodeId, medicationData) => {
    try {
      const res = await fetch(`/api/illness/${episodeId}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(medicationData),
      });
      if (!res.ok) throw new Error(`Failed to add medication: ${res.status}`);
      const med = await res.json();
      await get().fetchEpisode(episodeId);
      useToastStore.getState().show('用药记录添加成功', 'success');
      return med.id;
    } catch (error) {
      console.error('Failed to add medication:', error);
      useToastStore.getState().show('添加用药记录失败', 'error');
      throw error;
    }
  },

  updateMedication: async (episodeId, medId, updates) => {
    try {
      const res = await fetch(`/api/illness/${episodeId}/medications/${medId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`Failed to update medication: ${res.status}`);
      await get().fetchEpisode(episodeId);
      useToastStore.getState().show('用药记录更新成功', 'success');
    } catch (error) {
      console.error('Failed to update medication:', error);
      useToastStore.getState().show('更新用药记录失败', 'error');
      throw error;
    }
  },

  deleteMedication: async (episodeId, medId) => {
    try {
      const res = await fetch(`/api/illness/${episodeId}/medications/${medId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Failed to delete medication: ${res.status}`);
      await get().fetchEpisode(episodeId);
      useToastStore.getState().show('用药记录已删除', 'success');
    } catch (error) {
      console.error('Failed to delete medication:', error);
      useToastStore.getState().show('删除用药记录失败', 'error');
      throw error;
    }
  },

  addDoctorVisit: async (episodeId, visitData) => {
    try {
      const res = await fetch(`/api/illness/${episodeId}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitData),
      });
      if (!res.ok) throw new Error(`Failed to add doctor visit: ${res.status}`);
      const visit = await res.json();
      await get().fetchEpisode(episodeId);
      useToastStore.getState().show('就医记录添加成功', 'success');
      return visit.id;
    } catch (error) {
      console.error('Failed to add doctor visit:', error);
      useToastStore.getState().show('添加就医记录失败', 'error');
      throw error;
    }
  },

  updateDoctorVisit: async (episodeId, visitId, updates) => {
    try {
      const res = await fetch(`/api/illness/${episodeId}/visits/${visitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error(`Failed to update doctor visit: ${res.status}`);
      await get().fetchEpisode(episodeId);
      useToastStore.getState().show('就医记录更新成功', 'success');
    } catch (error) {
      console.error('Failed to update doctor visit:', error);
      useToastStore.getState().show('更新就医记录失败', 'error');
      throw error;
    }
  },

  deleteDoctorVisit: async (episodeId, visitId) => {
    try {
      const res = await fetch(`/api/illness/${episodeId}/visits/${visitId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`Failed to delete doctor visit: ${res.status}`);
      await get().fetchEpisode(episodeId);
      useToastStore.getState().show('就医记录已删除', 'success');
    } catch (error) {
      console.error('Failed to delete doctor visit:', error);
      useToastStore.getState().show('删除就医记录失败', 'error');
      throw error;
    }
  },

  clearCurrentEpisode: () => {
    set({ currentEpisode: null });
  },
}));