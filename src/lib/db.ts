import Dexie, { Table } from 'dexie';
import {
  IllnessEpisode,
  IllnessEpisodeDetail,
  IllnessEpisodeWithStats,
  IllnessRecord,
  Medication,
  DoctorVisit,
} from '@/types';

export class IllnessDatabase extends Dexie {
  episodes!: Table<IllnessEpisode>;
  records!: Table<IllnessRecord>;
  medications!: Table<Medication>;
  doctorVisits!: Table<DoctorVisit>;

  constructor() {
    super('ScientificParentingIllnessDB');
    // Define tables and indexes
    this.version(1).stores({
      episodes: 'id, start_date, end_date, title, created_at, updated_at',
      records: 'id, episode_id, recorded_at',
      medications: 'id, episode_id, name, start_date, end_date',
      doctorVisits: 'id, episode_id, visit_date',
    });
  }

  // Episode CRUD
  async addEpisode(episode: Omit<IllnessEpisode, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await this.episodes.add({
      ...episode,
      id,
      created_at: now,
      updated_at: now,
    });
    return id;
  }

  async getEpisode(id: string): Promise<IllnessEpisode | undefined> {
    return await this.episodes.get(id);
  }

  async getAllEpisodes(): Promise<IllnessEpisode[]> {
    return await this.episodes.toArray();
  }

  async updateEpisode(id: string, updates: Partial<Omit<IllnessEpisode, 'id' | 'created_at'>>): Promise<void> {
    await this.episodes.update(id, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
  }

  async deleteEpisode(id: string): Promise<void> {
    // Cascade delete associated records
    await this.transaction('rw', [this.records, this.medications, this.doctorVisits, this.episodes], async () => {
      await this.records.where('episode_id').equals(id).delete();
      await this.medications.where('episode_id').equals(id).delete();
      await this.doctorVisits.where('episode_id').equals(id).delete();
      await this.episodes.delete(id);
    });
  }

  // Illness Record CRUD
  async addRecord(record: Omit<IllnessRecord, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    await this.records.add({ ...record, id });
    return id;
  }

  async getRecordsByEpisode(episodeId: string): Promise<IllnessRecord[]> {
    return await this.records.where('episode_id').equals(episodeId).toArray();
  }

  async updateRecord(id: string, updates: Partial<IllnessRecord>): Promise<void> {
    await this.records.update(id, updates);
  }

  async deleteRecord(id: string): Promise<void> {
    await this.records.delete(id);
  }

  // Medication CRUD
  async addMedication(medication: Omit<Medication, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    await this.medications.add({ ...medication, id });
    return id;
  }

  async getMedicationsByEpisode(episodeId: string): Promise<Medication[]> {
    return await this.medications.where('episode_id').equals(episodeId).toArray();
  }

  async updateMedication(id: string, updates: Partial<Medication>): Promise<void> {
    await this.medications.update(id, updates);
  }

  async deleteMedication(id: string): Promise<void> {
    await this.medications.delete(id);
  }

  // Doctor Visit CRUD
  async addDoctorVisit(visit: Omit<DoctorVisit, 'id'>): Promise<string> {
    const id = crypto.randomUUID();
    await this.doctorVisits.add({ ...visit, id });
    return id;
  }

  async getDoctorVisitsByEpisode(episodeId: string): Promise<DoctorVisit[]> {
    return await this.doctorVisits.where('episode_id').equals(episodeId).toArray();
  }

  async updateDoctorVisit(id: string, updates: Partial<DoctorVisit>): Promise<void> {
    await this.doctorVisits.update(id, updates);
  }

  async deleteDoctorVisit(id: string): Promise<void> {
    await this.doctorVisits.delete(id);
  }

  // Utility: Get episode with all related data
  async getEpisodeDetail(episodeId: string): Promise<IllnessEpisodeDetail | undefined> {
    const episode = await this.episodes.get(episodeId);
    if (!episode) return undefined;
    const [records, medications, visits] = await Promise.all([
      this.getRecordsByEpisode(episodeId),
      this.getMedicationsByEpisode(episodeId),
      this.getDoctorVisitsByEpisode(episodeId),
    ]);
    return {
      ...episode,
      records,
      medications,
      doctor_visits: visits,
    };
  }

  // Utility: Get episodes with basic stats
  async getEpisodesWithStats(): Promise<IllnessEpisodeWithStats[]> {
    const episodes = await this.episodes.toArray();
    const stats = await Promise.all(
      episodes.map(async (ep) => {
        const records = await this.getRecordsByEpisode(ep.id);
        const temps = records
          .map((r) => r.temperature)
          .filter((t): t is number => t !== undefined);
        return {
          ...ep,
          record_count: records.length,
          max_temperature: temps.length > 0 ? Math.max(...temps) : undefined,
        };
      })
    );
    // Sort by start_date descending
    return stats.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
  }
}

// Singleton instance
export const db = new IllnessDatabase();
