import { create } from 'zustand';
import { useToastStore } from './toastStore';
import { db } from '@/lib/db';
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
      const episodes = await db.getEpisodesWithStats();
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
      const episode = await db.getEpisodeDetail(id);
      if (episode) {
        set({ currentEpisode: episode, loading: false });
      } else {
        set({ error: '未找到该记录', loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch episode:', error);
      useToastStore.getState().show('获取详情失败', 'error');
      set({ error: '获取详情失败', loading: false });
    }
  },

  createEpisode: async (episodeData) => {
    try {
      const id = await db.addEpisode(episodeData);
      await get().fetchEpisodes();
      useToastStore.getState().show('创建成功', 'success');
      return id;
    } catch (error) {
      console.error('Failed to create episode:', error);
      useToastStore.getState().show('创建失败', 'error');
      throw error;
    }
  },

  updateEpisode: async (id, updates) => {
    try {
      await db.updateEpisode(id, updates);
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
      await db.deleteEpisode(id);
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
      const id = await db.addRecord({ ...recordData, episode_id: episodeId });
      await get().fetchEpisode(episodeId);
      await get().fetchEpisodes(); // to update stats
      useToastStore.getState().show('记录添加成功', 'success');
      return id;
    } catch (error) {
      console.error('Failed to add record:', error);
      useToastStore.getState().show('添加记录失败', 'error');
      throw error;
    }
  },

  updateRecord: async (episodeId, recordId, updates) => {
    try {
      await db.updateRecord(recordId, updates);
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
      await db.deleteRecord(recordId);
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
      const id = await db.addMedication({ ...medicationData, episode_id: episodeId });
      await get().fetchEpisode(episodeId);
      useToastStore.getState().show('用药记录添加成功', 'success');
      return id;
    } catch (error) {
      console.error('Failed to add medication:', error);
      useToastStore.getState().show('添加用药记录失败', 'error');
      throw error;
    }
  },

  updateMedication: async (episodeId, medId, updates) => {
    try {
      await db.updateMedication(medId, updates);
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
      await db.deleteMedication(medId);
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
      const id = await db.addDoctorVisit({ ...visitData, episode_id: episodeId });
      await get().fetchEpisode(episodeId);
      useToastStore.getState().show('就医记录添加成功', 'success');
      return id;
    } catch (error) {
      console.error('Failed to add doctor visit:', error);
      useToastStore.getState().show('添加就医记录失败', 'error');
      throw error;
    }
  },

  updateDoctorVisit: async (episodeId, visitId, updates) => {
    try {
      await db.updateDoctorVisit(visitId, updates);
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
      await db.deleteDoctorVisit(visitId);
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
