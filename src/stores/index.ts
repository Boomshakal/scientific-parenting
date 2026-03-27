import { create } from 'zustand';
import { createRecordStore } from './createRecordStore';
import { useToastStore } from './toastStore';
import type {
  GrowthRecord,
  FeedingRecord,
  SleepRecord,
  Milestone,
  HealthRecord,
  MoodRecord,
  EducationRecord,
  Baby,
} from '@/types';

interface BabyStore {
  baby: Baby | null;
  loading: boolean;
  fetchBaby: () => Promise<void>;
  setBaby: (baby: Partial<Baby>) => Promise<void>;
}

export const useBabyStore = create<BabyStore>((set) => ({
  baby: null,
  loading: false,
  fetchBaby: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/baby');
      if (!res.ok) throw new Error(`获取宝宝信息失败 (${res.status})`);
      const data = await res.json();
      set({ baby: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch baby:', error);
      useToastStore.getState().show('获取宝宝信息失败', 'error');
      set({ loading: false });
    }
  },
  setBaby: async (baby) => {
    try {
      const res = await fetch('/api/baby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baby),
      });
      if (!res.ok) throw new Error(`保存失败 (${res.status})`);
      const data = await res.json();
      set({ baby: data });
      useToastStore.getState().show('保存成功', 'success');
    } catch (error) {
      console.error('Failed to update baby:', error);
      useToastStore.getState().show('保存失败', 'error');
    }
  },
}));

export const useGrowthStore = createRecordStore<GrowthRecord>({ apiPath: 'growth' });
export const useFeedingStore = createRecordStore<FeedingRecord>({ apiPath: 'feeding' });
export const useSleepStore = createRecordStore<SleepRecord>({ apiPath: 'sleep' });
export const useMilestoneStore = createRecordStore<Milestone>({ apiPath: 'milestone' });
export const useHealthStore = createRecordStore<HealthRecord>({ apiPath: 'health' });
export const useMoodStore = createRecordStore<MoodRecord>({ apiPath: 'mood' });
export const useEducationStore = createRecordStore<EducationRecord>({ apiPath: 'education' });
