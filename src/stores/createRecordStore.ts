import { create } from 'zustand';
import { useToastStore } from './toastStore';

export interface RecordStore<T extends { id: string }> {
  records: T[];
  loading: boolean;
  fetchRecords: (babyId: string) => Promise<void>;
  addRecord: (record: Omit<T, 'id'>, babyId: string) => Promise<void>;
  deleteRecord: (id: string, babyId: string) => Promise<void>;
  updateRecord: (id: string, data: Partial<T>, babyId: string) => Promise<void>;
}

interface CreateRecordStoreOptions<T extends { id: string }> {
  apiPath: string;
  listKey?: string;
  onAdd?: (record: T) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (record: T) => void;
}

export function createRecordStore<T extends { id: string }>(
  options: CreateRecordStoreOptions<T>
) {
  const { apiPath, onAdd, onDelete } = options;
  const { onUpdate } = options;

  return create<RecordStore<T>>((set) => ({
    records: [],
    loading: false,

    fetchRecords: async (babyId?: string) => {
      set({ loading: true });
      try {
        let url = `/api/${apiPath}`;
        if (babyId) {
          url += `?babyId=${encodeURIComponent(babyId)}`;
        }
        const res = await fetch(url);
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

    addRecord: async (record: Omit<T, 'id'>, babyId?: string) => {
      try {
        let url = `/api/${apiPath}`;
        if (babyId) {
          url += `?babyId=${encodeURIComponent(babyId)}`;
        }
        const res = await fetch(url, {
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

    deleteRecord: async (id: string, babyId?: string) => {
      try {
        let url = `/api/${apiPath}?id=${encodeURIComponent(id)}`;
        if (babyId) {
          url += `&babyId=${encodeURIComponent(babyId)}`;
        }
        const res = await fetch(url, { method: 'DELETE' });
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
    updateRecord: async (id: string, data: Partial<T>, babyId?: string) => {
      try {
        if (!data || Object.keys(data).length === 0) {
          throw new Error('No update data provided');
        }
        let url = `/api/${apiPath}?id=${encodeURIComponent(id)}`;
        if (babyId) {
          url += `&babyId=${encodeURIComponent(babyId)}`;
        }
        const res = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(`更新失败 (${res.status})`);
        const updatedRecord = await res.json();
        set((state) => ({
          records: state.records.map((r) => (r.id === id ? updatedRecord : r)),
        }));
        useToastStore.getState().show('更新成功', 'success');
        onUpdate?.(updatedRecord);
      } catch (error) {
        const message = error instanceof Error ? error.message : '更新记录失败';
        console.error(`Failed to update ${apiPath} record:`, error);
        useToastStore.getState().show(message, 'error');
      }
    },
  }));
}
