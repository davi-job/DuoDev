import type { CodeReadingQuestion, FillBlankQuestion, MultipleChoiceQuestion } from "../interfaces/interfaces";

export type StreakPeriod = 'week' | 'month' | 'year';
export type QuestionType = 'multiple-choice' | 'fill-blank' | 'code-reading';
export type Question = MultipleChoiceQuestion | FillBlankQuestion | CodeReadingQuestion;