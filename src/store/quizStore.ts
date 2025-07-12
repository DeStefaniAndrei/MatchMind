import { create } from 'zustand';

type Question = {
  id: string;
  text: string;
  correctAnswer: boolean; // or 'yes'/'no' if you prefer
};

type QuizState = {
  currentQuestion: Question | null;
  userAnswer: boolean | null;
  reward: number;
  setQuestion: (question: Question) => void;
  answerQuestion: (answer: boolean) => void;
  incrementReward: () => void;
  reset: () => void;
};

export const useQuizStore = create<QuizState>((set) => ({
  currentQuestion: null,
  userAnswer: null,
  reward: 0,
  setQuestion: (question) => set({ currentQuestion: question, userAnswer: null }),
  answerQuestion: (answer) => set({ userAnswer: answer }),
  incrementReward: () => set((state) => ({ reward: state.reward + 1 })),
  reset: () => set({ currentQuestion: null, userAnswer: null, reward: 0 }),
}));
