import { ClassType, LessonSession, Package, Skill, StudentProgress, User, UserRole, FinancialStat } from './types';

export const CURRENT_USER_CLIENT: User = {
  id: 'u1',
  name: 'Demo Client',
  email: 'client@example.com',
  role: UserRole.CLIENT,
};

export const CURRENT_USER_INSTRUCTOR: User = {
  id: 'i1',
  name: 'Demo Instructor',
  email: 'instructor@example.com',
  role: UserRole.INSTRUCTOR,
};

export const CURRENT_USER_ADMIN: User = {
  id: 'a1',
  name: 'Demo Admin',
  email: 'admin@example.com',
  role: UserRole.ADMIN,
};

export const ALL_USERS: User[] = [];

// Keep these as they might be used for seeding or reference, but empty out the lists if they are "demo" data.
// However, CLASS_TYPES are often "configuration" rather than "data". 
// If the user wants "demo data" gone, they usually mean "fake rows".
// I will keep CLASS_TYPES empty or commented out if they are not used.
// But Landing.tsx now fetches from API.
// So I can make them empty.

export const CLASS_TYPES: ClassType[] = [];

export const PACKAGES: Package[] = [];

export const SKILLS: Skill[] = [
  { id: 's1', name: 'Face Submersion (5s)', category: 'Comfort' },
  { id: 's2', name: 'Front Float (Unsupported)', category: 'Buoyancy' },
  { id: 's3', name: 'Freestyle Arms', category: 'Strokes' },
  { id: 's4', name: 'Side Breathing', category: 'Strokes' },
  { id: 's5', name: 'Treading Water (1min)', category: 'Safety' },
];

export const SESSIONS: LessonSession[] = [];

export const MOCK_STUDENT_PROGRESS: StudentProgress[] = [];

export const ADMIN_STATS: FinancialStat[] = [];