export interface Baby {
  id: string;
  name: string;
  birthday: string;
  gender: 'male' | 'female';
  avatar?: string;
}

export interface GrowthRecord {
  id: string;
  date: string;
  height: number;    // cm
  weight: number;    // kg
  headCirc: number;  // cm
  notes?: string;
}

export interface FeedingRecord {
  id: string;
  date: string;
  time: string;
  type: 'breast' | 'formula' | 'solid';
  amount?: number;   // ml
  food?: string;
  duration?: number; // minutes for breastfeeding
  notes?: string;
}

export interface SleepRecord {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;        // minutes
  quality: 'good' | 'normal' | 'bad';
  notes?: string;
}

export interface Milestone {
  id: string;
  type: string;
  achievedDate: string;
  notes?: string;
  photo?: string;
}

export const MILESTONE_TYPES = [
  { key: 'smile', label: '第一次微笑', emoji: '😊', month: 1 },
  { key: 'head_up', label: '抬头', emoji: '👶', month: 2 },
  { key: 'social_smile', label: '社会性微笑', emoji: '😄', month: 2 },
  { key: 'grab', label: '抓握物品', emoji: '✊', month: 4 },
  { key: 'rollover', label: '翻身', emoji: '🤸', month: 4 },
  { key: 'sit_alone', label: '独坐', emoji: '🪑', month: 6 },
  { key: 'solid_food', label: '添加辅食', emoji: '🥄', month: 6 },
  { key: 'crawl', label: '爬行', emoji: '🦎', month: 8 },
  { key: 'stand', label: '扶站', emoji: '🧍', month: 9 },
  { key: 'pincer', label: '拇指食指抓握', emoji: '👌', month: 9 },
  { key: 'first_word', label: '第一句话', emoji: '💬', month: 12 },
  { key: 'walk', label: '独立行走', emoji: '🚶', month: 12 },
  { key: 'run', label: '跑步', emoji: '🏃', month: 18 },
  { key: 'jump', label: '跳跃', emoji: '🦘', month: 24 },
  { key: 'dress', label: '自己穿衣', emoji: '👕', month: 36 },
  { key: 'toilet', label: '如厕训练', emoji: '🚽', month: 24 },
] as const;

export interface HealthRecord {
  id: string;
  date: string;
  type: 'checkup' | 'vaccine' | 'medicine';
  title: string;
  details: string;
  nextDate?: string;
  notes?: string;
}

export const HEALTH_TYPES = {
  checkup: { label: '体检', emoji: '🏥', color: 'blue' },
  vaccine: { label: '疫苗', emoji: '💉', color: 'green' },
  medicine: { label: '用药', emoji: '💊', color: 'orange' },
} as const;

export interface MoodRecord {
  id: string;
  date: string;
  time: string;
  mood: 'happy' | 'calm' | 'fussy' | 'crying';
  notes?: string;
}

export const MOOD_TYPES = {
  happy: { label: '开心', emoji: '😊', color: 'yellow' },
  calm: { label: '平静', emoji: '😌', color: 'blue' },
  fussy: { label: '烦躁', emoji: '😤', color: 'orange' },
  crying: { label: '哭闹', emoji: '😭', color: 'red' },
} as const;

export interface EducationRecord {
  id: string;
  date: string;
  time: string;
  type: 'reading' | 'game' | 'outdoor' | 'music' | 'art';
  duration: number;   // minutes
  description?: string;
}

export const EDUCATION_TYPES = {
  reading: { label: '阅读', emoji: '📚', color: 'blue' },
  game: { label: '游戏', emoji: '🎮', color: 'green' },
  outdoor: { label: '户外', emoji: '🌳', color: 'emerald' },
  music: { label: '音乐', emoji: '🎵', color: 'purple' },
  art: { label: '美术', emoji: '🎨', color: 'pink' },
} as const;

export interface DailySummary {
  date: string;
  feedingCount: number;
  totalSleep: number;
  moods: MoodRecord['mood'][];
  activities: number;
}
