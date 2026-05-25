import type { QuestionType } from '../types/types';

export interface UserTrailAPI {
    trail: TrailAPI;
    progressoPct: number;
    acertos?: number;
    erros?: number;
}

export interface JwtPayload {
    sub: string;
    email: string;
    name?: string;
}

export interface TrailAPI {
    id: string;
    nome: string;
    nivel: string;
    totalHoras: number;
    ano: number;
}

export interface LearningCategorySummary {
    id: string;
    name: string;
    icon?: string | null;
    thumbColor: string;
}

export interface LearningContentCounts {
    lessons: number;
    questions: number;
    challenges: number;
}

export interface LearningTrailSummary {
    id: string;
    categoryId?: string | null;
    category?: LearningCategorySummary | null;
    name: string;
    level: string;
    description: string;
    duration?: string | null;
    totalHours?: number | null;
    year?: number | null;
    thumbColor: string;
    status: string;
    contentCounts: LearningContentCounts;
}

export interface LessonElement {
    id: string;
    type: 'texto' | 'imagem';
    content: string;
    order: number;
}

export interface LearningLessonItem {
    id: string;
    type: 'lesson';
    order: number;
    title: string;
    status: string;
    elements: LessonElement[];
}

export interface LearningQuestionItem {
    id: string;
    type: 'question';
    order: number;
    title: string;
    status: string;
    description: string | null;
    questionType: QuestionType;
    codeSnippet: string | null;
    sentence: string | null;
    blanks: string[];
    correctOrder: string[];
    alternatives: { id: string; text: string }[];
    answer: string;
}

export interface LearningChallengeItem {
    id: string;
    type: 'challenge';
    order: number;
    title: string;
    status: string;
    description: string | null;
    instructions: string | null;
}

export type LearningContentItem =
    | LearningLessonItem
    | LearningQuestionItem
    | LearningChallengeItem;

export interface LearningTrailContentResponse {
    trail: LearningTrailSummary;
    items: LearningContentItem[];
}

export interface StreakStats {
    sequenciaAtual: number;
    melhorSequencia: number;
}

export interface StreakLog {
    dataRegistro: string;
    concluido: boolean;
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface BaseQuestion {
    id: string | number;
    type: QuestionType;
    question: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
    type: 'multiple-choice';
    options: { label: string; text: string }[];
    correct: string; // label
}

export interface FillBlankQuestion extends BaseQuestion {
    type: 'fill-blank';
    blanks: string[]; // the words to arrange
    sentence: string; // full sentence with ___ placeholder
    correctOrder: string[]; // correct sequence
}

export interface CodeReadingQuestion extends BaseQuestion {
    type: 'code-reading';
    code: string;
    options: { label: string; text: string }[];
    correct: string;
}
