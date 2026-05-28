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
  babies: Baby[];
  currentBabyId: string | null;
  baby: Baby | null; // current baby
  loading: boolean;
  fetchBabies: () => Promise<void>;
  setCurrentBaby: (babyId: string) => void;
  fetchBaby: () => Promise<void>; // fetch current baby (by currentBabyId or fallback)
  setBaby: (updates: Partial<Baby>) => Promise<void>; // update current baby
}

export const useBabyStore = create<BabyStore>((set, get) => ({
  babies: [],
  currentBabyId: null,
  baby: null,
  loading: false,

  fetchBabies: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/babies');
      if (!res.ok) throw new Error('Failed to fetch babies');
      const data: Baby[] = await res.json();
      set({ babies: data, loading: false });
      const { currentBabyId } = get();
      if (!currentBabyId && data.length > 0) {
        set({ baby: data[0], currentBabyId: data[0].id, loading: false });
      } else if (currentBabyId) {
        const current = data.find(b => b.id === currentBabyId) || null;
        if (current) {
          set({ baby: current, loading: false });
        } else {
          // currentBabyId points to a deleted baby, reset to first available
          if (data.length > 0) {
            set({ baby: data[0], currentBabyId: data[0].id, loading: false });
          } else {
            // No babies at all
            set({ baby: null, currentBabyId: null, loading: false });
          }
        }
      }
      // Note: if no babies exist, don't set baby here - caller should handle via fetchBaby
    } catch (error) {
      console.error('Failed to fetch babies:', error);
      useToastStore.getState().show('获取宝宝列表失败', 'error');
      set({ loading: false });
    }
  },

  setCurrentBaby: (babyId) => {
    const { babies } = get();
    const baby = babies.find(b => b.id === babyId) || null;
    set({ baby, currentBabyId: babyId });
  },

  fetchBaby: async () => {
    const { currentBabyId } = get();
    if (currentBabyId) {
      const res = await fetch(`/api/baby?babyId=${currentBabyId}`);
      if (res.ok) {
        const data = await res.json();
        set({ baby: data });
        return;
      }
    }
    // No currentBabyId or fetch failed - fetch all babies to find any existing baby
    const { babies } = get();
    if (babies.length === 0) {
      // If we don't have babies list yet, fetch it
      await get().fetchBabies();
      // After fetching babies, check again
      const { babies: updatedBabies, currentBabyId: updatedCurrentBabyId } = get();
      if (updatedBabies.length > 0) {
        // fetchBabies should have set baby, but ensure we have current baby
        if (!updatedCurrentBabyId) {
          set({ currentBabyId: updatedBabies[0].id, baby: updatedBabies[0] });
        }
        return;
      }
      // Still no babies - need to create one via /api/baby
      try {
        const res = await fetch('/api/baby', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          set({ baby: data, currentBabyId: data.id });
          // Also refresh babies list
          await get().fetchBabies();
          return;
        }
      } catch (error) {
        console.error('Failed to create default baby:', error);
      }
    } else {
      // We have babies list but no currentBabyId - set first
      if (babies.length > 0) {
        set({ baby: babies[0], currentBabyId: babies[0].id });
      }
    }
  },

  setBaby: async (updates) => {
    const { baby } = get();
    console.log('setBaby called with updates:', updates, 'current baby:', baby);
    if (!baby) {
      useToastStore.getState().show('未选择宝宝', 'error');
      return;
    }
    try {
      // Update current baby via POST with babyId query param
      const url = `/api/baby?babyId=${baby.id}`;
      console.log('POSTing to:', url, updates);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      console.log('Response status:', res.status, res.statusText);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Update baby failed:', res.status, errorData);
        throw new Error('Failed to update baby');
      }
      const data = await res.json();
      console.log('Update success:', data);
      set({ baby: data });
      // Update babies list
      set((state) => ({
        babies: state.babies.map(b => b.id === data.id ? data : b)
      }));
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
