export interface Project {
  id: string;
  name: string;
  description: string;
  totalSeconds: number;
  targetSeconds: number; // Usually 10,000 hours in seconds
  createdAt: number;
  updatedAt: number;
  isArchived: boolean;
  color: string;
  icon: string;
}

export interface TimeLog {
  id: string;
  projectId: string;
  seconds: number;
  startTime: number;
  endTime: number;
  note?: string;
}

export const TARGET_HOURS = 10000;
export const TARGET_SECONDS = TARGET_HOURS * 3600;

export const PROJECT_COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export const PROJECT_ICONS = [
  'Book',
  'Code',
  'Music',
  'Palette',
  'Dumbbell',
  'Heart',
  'Briefcase',
  'Coffee',
  'Camera',
  'Globe',
];
