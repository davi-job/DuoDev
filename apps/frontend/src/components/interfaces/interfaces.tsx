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
    id: number;
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