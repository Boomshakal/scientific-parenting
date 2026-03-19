import { create } from 'zustand';
import {
  GrowthRecord,
  FeedingRecord,
  SleepRecord,
  Milestone,
  HealthRecord,
  MoodRecord,
  EducationRecord,
  Baby,
} from '@/types';

// Baby Store
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
      const data = await res.json();
      set({ baby: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch baby:', error);
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
      const data = await res.json();
      set({ baby: data });
    } catch (error) {
      console.error('Failed to update baby:', error);
    }
  },
}));

// Growth Store
interface GrowthStore {
  records: GrowthRecord[];
  loading: boolean;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<GrowthRecord, 'id'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useGrowthStore = create<GrowthStore>((set) => ({
  records: [],
  loading: false,
  fetchRecords: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/growth');
      const data = await res.json();
      set({ records: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch growth records:', error);
      set({ loading: false });
    }
  },
  addRecord: async (record) => {
    try {
      const res = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      const newRecord = await res.json();
      set((state) => ({ records: [newRecord, ...state.records] }));
    } catch (error) {
      console.error('Failed to add growth record:', error);
    }
  },
  deleteRecord: async (id) => {
    try {
      await fetch(`/api/growth?id=${id}`, { method: 'DELETE' });
      set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
    } catch (error) {
      console.error('Failed to delete growth record:', error);
    }
  },
}));

// Feeding Store
interface FeedingStore {
  records: FeedingRecord[];
  loading: boolean;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<FeedingRecord, 'id'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useFeedingStore = create<FeedingStore>((set) => ({
  records: [],
  loading: false,
  fetchRecords: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/feeding');
      const data = await res.json();
      set({ records: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch feeding records:', error);
      set({ loading: false });
    }
  },
  addRecord: async (record) => {
    try {
      const res = await fetch('/api/feeding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      const newRecord = await res.json();
      set((state) => ({ records: [newRecord, ...state.records] }));
    } catch (error) {
      console.error('Failed to add feeding record:', error);
    }
  },
  deleteRecord: async (id) => {
    try {
      await fetch(`/api/feeding?id=${id}`, { method: 'DELETE' });
      set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
    } catch (error) {
      console.error('Failed to delete feeding record:', error);
    }
  },
}));

// Sleep Store
interface SleepStore {
  records: SleepRecord[];
  loading: boolean;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<SleepRecord, 'id'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useSleepStore = create<SleepStore>((set) => ({
  records: [],
  loading: false,
  fetchRecords: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/sleep');
      const data = await res.json();
      set({ records: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch sleep records:', error);
      set({ loading: false });
    }
  },
  addRecord: async (record) => {
    try {
      const res = await fetch('/api/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      const newRecord = await res.json();
      set((state) => ({ records: [newRecord, ...state.records] }));
    } catch (error) {
      console.error('Failed to add sleep record:', error);
    }
  },
  deleteRecord: async (id) => {
    try {
      await fetch(`/api/sleep?id=${id}`, { method: 'DELETE' });
      set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
    } catch (error) {
      console.error('Failed to delete sleep record:', error);
    }
  },
}));

// Milestone Store
interface MilestoneStore {
  milestones: Milestone[];
  loading: boolean;
  fetchMilestones: () => Promise<void>;
  addMilestone: (milestone: Omit<Milestone, 'id'>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
}

export const useMilestoneStore = create<MilestoneStore>((set) => ({
  milestones: [],
  loading: false,
  fetchMilestones: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/milestone');
      const data = await res.json();
      set({ milestones: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
      set({ loading: false });
    }
  },
  addMilestone: async (milestone) => {
    try {
      const res = await fetch('/api/milestone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(milestone),
      });
      const newMilestone = await res.json();
      set((state) => ({ milestones: [newMilestone, ...state.milestones] }));
    } catch (error) {
      console.error('Failed to add milestone:', error);
    }
  },
  deleteMilestone: async (id) => {
    try {
      await fetch(`/api/milestone?id=${id}`, { method: 'DELETE' });
      set((state) => ({ milestones: state.milestones.filter((m) => m.id !== id) }));
    } catch (error) {
      console.error('Failed to delete milestone:', error);
    }
  },
}));

// Health Store
interface HealthStore {
  records: HealthRecord[];
  loading: boolean;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<HealthRecord, 'id'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useHealthStore = create<HealthStore>((set) => ({
  records: [],
  loading: false,
  fetchRecords: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      set({ records: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch health records:', error);
      set({ loading: false });
    }
  },
  addRecord: async (record) => {
    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      const newRecord = await res.json();
      set((state) => ({ records: [newRecord, ...state.records] }));
    } catch (error) {
      console.error('Failed to add health record:', error);
    }
  },
  deleteRecord: async (id) => {
    try {
      await fetch(`/api/health?id=${id}`, { method: 'DELETE' });
      set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
    } catch (error) {
      console.error('Failed to delete health record:', error);
    }
  },
}));

// Mood Store
interface MoodStore {
  records: MoodRecord[];
  loading: boolean;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<MoodRecord, 'id'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useMoodStore = create<MoodStore>((set) => ({
  records: [],
  loading: false,
  fetchRecords: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/mood');
      const data = await res.json();
      set({ records: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch mood records:', error);
      set({ loading: false });
    }
  },
  addRecord: async (record) => {
    try {
      const res = await fetch('/api/mood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      const newRecord = await res.json();
      set((state) => ({ records: [newRecord, ...state.records] }));
    } catch (error) {
      console.error('Failed to add mood record:', error);
    }
  },
  deleteRecord: async (id) => {
    try {
      await fetch(`/api/mood?id=${id}`, { method: 'DELETE' });
      set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
    } catch (error) {
      console.error('Failed to delete mood record:', error);
    }
  },
}));

// Education Store
interface EducationStore {
  records: EducationRecord[];
  loading: boolean;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<EducationRecord, 'id'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useEducationStore = create<EducationStore>((set) => ({
  records: [],
  loading: false,
  fetchRecords: async () => {
    set({ loading: true });
    try {
      const res = await fetch('/api/education');
      const data = await res.json();
      set({ records: data, loading: false });
    } catch (error) {
      console.error('Failed to fetch education records:', error);
      set({ loading: false });
    }
  },
  addRecord: async (record) => {
    try {
      const res = await fetch('/api/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
      const newRecord = await res.json();
      set((state) => ({ records: [newRecord, ...state.records] }));
    } catch (error) {
      console.error('Failed to add education record:', error);
    }
  },
  deleteRecord: async (id) => {
    try {
      await fetch(`/api/education?id=${id}`, { method: 'DELETE' });
      set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
    } catch (error) {
      console.error('Failed to delete education record:', error);
    }
  },
}));
