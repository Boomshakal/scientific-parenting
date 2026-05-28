import { createRecordStore } from '@/stores/createRecordStore';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch as any;

describe('createRecordStore', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('updateRecord sends PATCH request with correct URL and body', async () => {
    const mockUpdated = { id: '1', name: 'Updated' };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUpdated,
    });

    const useStore = createRecordStore<{id: string, name: string}>({ apiPath: 'test' });
    const store = useStore();

    await store.updateRecord('1', { name: 'Updated' }, 'baby-123');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/test?id=1&babyId=baby-123'),
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated' }),
      })
    );
    expect(store.records[0]).toEqual(mockUpdated);
  });

  it('updateRecord calls onUpdate callback when provided', async () => {
    const onUpdate = jest.fn();
    const mockUpdated = { id: '1', name: 'Updated' };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockUpdated,
    });

    const useStore = createRecordStore<{id: string, name: string}>({
      apiPath: 'test',
      onUpdate,
    });
    const store = useStore();

    await store.updateRecord('1', { name: 'Updated' }, 'baby-123');

    expect(onUpdate).toHaveBeenCalledWith(mockUpdated);
  });
});
