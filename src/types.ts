export interface Subject {
  id: string;
  name: string;
}

export interface Question {
  id?: number;
  subject_id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty?: string;
  is_favorite?: boolean;
}

export interface PracticeHistory {
  id: number;
  subject_id: string;
  score: number;
  total: number;
  duration: number;
  created_at: string;
}

export interface Stats {
  subjectStats: {
    id: string;
    name: string;
    questionCount: number;
    totalCorrect: number;
    totalAttempted: number;
  }[];
  recentHistory: PracticeHistory[];
}
