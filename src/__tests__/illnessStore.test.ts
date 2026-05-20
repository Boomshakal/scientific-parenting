import { useIllnessStore } from '@/stores/illnessStore';
import { db } from '@/lib/db';
import { IllnessEpisode, IllnessRecord, Medication, DoctorVisit } from '@/types';

// Mock the database
jest.mock('@/lib/db', () => ({
  db: {
    addEpisode: jest.fn(),
    getEpisode: jest.fn(),
    getAllEpisodes: jest.fn(),
    updateEpisode: jest.fn(),
    deleteEpisode: jest.fn(),
    addRecord: jest.fn(),
    getRecordsByEpisode: jest.fn(),
    updateRecord: jest.fn(),
    deleteRecord: jest.fn(),
    addMedication: jest.fn(),
    getMedicationsByEpisode: jest.fn(),
    updateMedication: jest.fn(),
    deleteMedication: jest.fn(),
    addDoctorVisit: jest.fn(),
    getDoctorVisitsByEpisode: jest.fn(),
    updateDoctorVisit: jest.fn(),
    deleteDoctorVisit: jest.fn(),
    getEpisodeDetail: jest.fn(),
    getEpisodesWithStats: jest.fn(),
  },
}));

// Mock toast store
jest.mock('@/stores/toastStore', () => ({
  useToastStore: {
    getState: () => ({
      show: jest.fn(),
    }),
  },
}));

describe('illnessStore', () => {
  beforeEach(() => {
    // Reset store and mock implementations
    useIllnessStore.setState({
      episodes: [],
      currentEpisode: null,
      loading: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  describe('Episode CRUD', () => {
    const mockEpisode: IllnessEpisode = {
      id: 'ep1',
      start_date: '2025-01-15',
      title: '流感',
      description: '测试描述',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    it('should create an episode', async () => {
      (db.addEpisode as jest.Mock).mockResolvedValue(mockEpisode.id);
      (db.getEpisodesWithStats as jest.Mock).mockResolvedValue([]);

      const store = useIllnessStore.getState();
      await store.createEpisode({
        title: mockEpisode.title,
        start_date: mockEpisode.start_date,
        description: mockEpisode.description,
      });

      expect(db.addEpisode).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockEpisode.title,
          start_date: mockEpisode.start_date,
          description: mockEpisode.description,
        })
      );
      // After creation, fetchEpisodes is called; check that it refreshed
      expect(db.getEpisodesWithStats).toHaveBeenCalled();
    });

    it('should fetch episodes with stats', async () => {
      const mockStats = [
        {
          ...mockEpisode,
          record_count: 5,
          max_temperature: 38.5,
        },
      ];
      (db.getEpisodesWithStats as jest.Mock).mockResolvedValue(mockStats);

      const store = useIllnessStore.getState();
      await store.fetchEpisodes();

      expect(useIllnessStore.getState().episodes).toEqual(mockStats);
    });

    it('should fetch a single episode with related data', async () => {
      const mockDetail = {
        ...mockEpisode,
        records: [],
        medications: [],
        doctor_visits: [],
      };
      (db.getEpisodeDetail as jest.Mock).mockResolvedValue(mockDetail);

      const store = useIllnessStore.getState();
      await store.fetchEpisode('ep1');

      expect(useIllnessStore.getState().currentEpisode).toEqual(mockDetail);
    });

    it('should update an episode', async () => {
      (db.updateEpisode as jest.Mock).mockResolvedValue(undefined);
      (db.getEpisodesWithStats as jest.Mock).mockResolvedValue([]);
      (db.getEpisodeDetail as jest.Mock).mockResolvedValue(null);

      const store = useIllnessStore.getState();
      await store.updateEpisode('ep1', { title: '新标题' });

      expect(db.updateEpisode).toHaveBeenCalledWith('ep1', { title: '新标题' });
    });

    it('should delete an episode', async () => {
      (db.deleteEpisode as jest.Mock).mockResolvedValue(undefined);
      (db.getEpisodesWithStats as jest.Mock).mockResolvedValue([]);

      // Mock window.confirm to return true
      window.confirm = jest.fn(() => true);

      const store = useIllnessStore.getState();
      await store.deleteEpisode('ep1');

      expect(db.deleteEpisode).toHaveBeenCalledWith('ep1');
      expect(db.getEpisodesWithStats).toHaveBeenCalled();
    });
  });

  describe('Illness Record CRUD', () => {
    it('should add a record to an episode', async () => {
      (db.addRecord as jest.Mock).mockResolvedValue('rec1');
      (db.getEpisodeDetail as jest.Mock).mockResolvedValue({
        id: 'ep1',
        start_date: '2025-01-15',
        title: '流感',
        created_at: '',
        updated_at: '',
        records: [],
        medications: [],
        doctor_visits: [],
      });
      (db.getEpisodesWithStats as jest.Mock).mockResolvedValue([]);

      const store = useIllnessStore.getState();
      await store.addRecord('ep1', {
        recorded_at: new Date().toISOString(),
        symptoms: ['发烧'],
        temperature: 38.5,
        temperature_method: 'axillary',
        appetite: 'good',
        sleep_quality: 'fair',
        mood: 'normal',
      });

      expect(db.addRecord).toHaveBeenCalledWith(
        expect.objectContaining({
          episode_id: 'ep1',
          symptoms: ['发烧'],
          temperature: 38.5,
        })
      );
    });

    it('should delete a record', async () => {
      (db.deleteRecord as jest.Mock).mockResolvedValue(undefined);
      (db.getEpisodeDetail as jest.Mock).mockResolvedValue({
        id: 'ep1',
        start_date: '2025-01-15',
        title: '流感',
        created_at: '',
        updated_at: '',
        records: [],
        medications: [],
        doctor_visits: [],
      });
      (db.getEpisodesWithStats as jest.Mock).mockResolvedValue([]);

      const store = useIllnessStore.getState();
      await store.deleteRecord('ep1', 'rec1');

      expect(db.deleteRecord).toHaveBeenCalledWith('rec1');
    });
  });

  describe('Medication CRUD', () => {
    it('should add medication', async () => {
      (db.addMedication as jest.Mock).mockResolvedValue('med1');
      (db.getEpisodeDetail as jest.Mock).mockResolvedValue({
        id: 'ep1',
        start_date: '2025-01-15',
        title: '流感',
        created_at: '',
        updated_at: '',
        records: [],
        medications: [],
        doctor_visits: [],
      });

      const store = useIllnessStore.getState();
      await store.addMedication('ep1', {
        name: '布洛芬',
        dosage: '5ml',
        frequency: '每6小时',
        route: 'oral',
        start_date: '2025-01-15',
      });

      expect(db.addMedication).toHaveBeenCalledWith(
        expect.objectContaining({
          episode_id: 'ep1',
          name: '布洛芬',
        })
      );
    });

    it('should delete medication', async () => {
      (db.deleteMedication as jest.Mock).mockResolvedValue(undefined);
      (db.getEpisodeDetail as jest.Mock).mockResolvedValue({
        id: 'ep1',
        start_date: '2025-01-15',
        title: '流感',
        created_at: '',
        updated_at: '',
        records: [],
        medications: [],
        doctor_visits: [],
      });

      const store = useIllnessStore.getState();
      await store.deleteMedication('ep1', 'med1');

      expect(db.deleteMedication).toHaveBeenCalledWith('med1');
    });
  });

  describe('Doctor Visit CRUD', () => {
    it('should add doctor visit', async () => {
      (db.addDoctorVisit as jest.Mock).mockResolvedValue('visit1');
      (db.getEpisodeDetail as jest.Mock).mockResolvedValue({
        id: 'ep1',
        start_date: '2025-01-15',
        title: '流感',
        created_at: '',
        updated_at: '',
        records: [],
        medications: [],
        doctor_visits: [],
      });

      const store = useIllnessStore.getState();
      await store.addDoctorVisit('ep1', {
        visit_date: new Date().toISOString(),
        hospital: '儿童医院',
        diagnosis: '流感',
      });

      expect(db.addDoctorVisit).toHaveBeenCalledWith(
        expect.objectContaining({
          episode_id: 'ep1',
          hospital: '儿童医院',
        })
      );
    });

    it('should delete doctor visit', async () => {
      (db.deleteDoctorVisit as jest.Mock).mockResolvedValue(undefined);
      (db.getEpisodeDetail as jest.Mock).mockResolvedValue({
        id: 'ep1',
        start_date: '2025-01-15',
        title: '流感',
        created_at: '',
        updated_at: '',
        records: [],
        medications: [],
        doctor_visits: [],
      });

      const store = useIllnessStore.getState();
      await store.deleteDoctorVisit('ep1', 'visit1');

      expect(db.deleteDoctorVisit).toHaveBeenCalledWith('visit1');
    });
  });
});
