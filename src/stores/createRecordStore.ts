import { create } from 'zustand';
import { useToastStore } from './toastStore';

export interface RecordStore<T extends { id: string }> {
  records: T[];
  loading: boolean;
  fetchRecords: () => Promise<void>;
  addRecord: (record: Omit<T, 'id'>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
}

interface CreateRecordStoreOptions<T extends { id: string }> {
  apiPath: string;
  listKey?: string;
  onAdd?: (record: T) => void;
  onDelete?: (id: string) => void;
}

export function createRecordStore<T extends { id: string }>(
  options: CreateRecordStoreOptions<T>
) {
  const { apiPath, onAdd, onDelete } = options;

  return create<RecordStore<T>>((set) => ({
    records: [],
    loading: false,

    fetchRecords: async () => {
      set({ loading: true });
      try {
        const res = await fetch(`/api/${apiPath}`);
        if (!res.ok) throw new Error(`获取数据失败 (${res.status})`);
        const data = await res.json();
        set({ records: data, loading: false });
      } catch (error) {
        const message = error instanceof Error ? error.message : '获取数据失败';
        console.error(`Failed to fetch ${apiPath} records:`, error);
        useToastStore.getState().show(message, 'error');
        set({ loading: false });
      }
    },

    addRecord: async (record) => {
      try {
        const res = await fetch(`/api/${apiPath}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
        if (!res.ok) throw new Error(`添加失败 (${res.status})`);
        const newRecord = await res.json();
        set((state) => ({ records: [newRecord, ...state.records] }));
        useToastStore.getState().show('添加成功', 'success');
        onAdd?.(newRecord);
      } catch (error) {
        const message = error instanceof Error ? error.message : '添加记录失败';
        console.error(`Failed to add ${apiPath} record:`, error);
        useToastStore.getState().show(message, 'error');
      }
    },

    deleteRecord: async (id) => {
      try {
        const res = await fetch(`/api/${apiPath}?id=${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(`删除失败 (${res.status})`);
        set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
        useToastStore.getState().show('删除成功', 'success');
        onDelete?.(id);
      } catch (error) {
        const message = error instanceof Error ? error.message : '删除记录失败';
        console.error(`Failed to delete ${apiPath} record:`, error);
        useToastStore.getState().show(message, 'error');
      }
    },
  }));
}
