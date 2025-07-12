type FixtureData = {
    id: number;
    name: string;
    scores: any[];
    events: any[];
    statistics: any[];
    lineups: any[];
};
  
export type Question = {
    id: string;
    text: string;
    correctAnswer: boolean;
};
  
export function generateRandomQuestion(data: FixtureData): Question | null {
    // Example: Is the home team winning?
    const currentScoreHome = data.scores?.find(
      (s) => s.description === 'CURRENT' && s.score.participant === 'home'
    )?.score.goals ?? 0;
    const currentScoreAway = data.scores?.find(
      (s) => s.description === 'CURRENT' && s.score.participant === 'away'
    )?.score.goals ?? 0;
  
    // Example question
    return {
      id: String(Date.now()),
      text: `Is the home team currently winning?`,
      correctAnswer: currentScoreHome > currentScoreAway,
    };
}
  