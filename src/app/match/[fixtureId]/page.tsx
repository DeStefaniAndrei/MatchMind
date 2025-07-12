'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { generateRandomQuestion, Question } from '@/utils/generateQuestion';


type FixtureData = {
    id: number;
    name: string;
    scores: any[];
    events: any[];
    statistics: any[];
    lineups: any[];
};

export default function MatchDetailsPage() {
  const { fixtureId } = useParams();
  const [data, setData] = useState<FixtureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [question, setQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);


  useEffect(() => {
    if (!fixtureId) return;
    
    const fetchMatchData = async () => {
      try {
        console.log('Fetching data for fixture:', fixtureId);
        
        // Use the local API route instead of calling Sportmonks directly
        const res = await fetch(`/api/match/${fixtureId}`);
        
        console.log('Response status:', res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const json = await res.json();
        console.log('API Response:', json);
        
        if (json.data) {
          setData(json.data);
        } else {
          setError('No data property in response');
          console.error('Response structure:', json);
        }
      } catch (error) {
        console.error('Failed to fetch match data:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }      
    };

    fetchMatchData();
  }, [fixtureId]);
  
  useEffect(() => {
    if (data) {
      const q = generateRandomQuestion(data);
      setQuestion(q);
      setUserAnswer(null);
      setIsCorrect(null);
    }
  }, [data]);

  const handleAnswer = (answer: boolean) => {
    console.log('Button clicked:', answer);
    console.log('Current question:', question);
    console.log('Current userAnswer:', userAnswer);
    console.log('Question correct answer:', question?.correctAnswer);
    
    setUserAnswer(answer);
    const correct = answer === question?.correctAnswer;
    console.log('Setting isCorrect to:', correct);
    setIsCorrect(correct);
    
    // If incorrect, automatically reset after 2 seconds
    if (!correct && data) {
      setTimeout(() => {
        console.log('Auto-resetting for incorrect answer');
        const newQuestion = generateRandomQuestion(data);
        setQuestion(newQuestion);
        setUserAnswer(null);
        setIsCorrect(null);
      }, 2000); // 2 second delay
    }
    
    // Force a re-render by logging the new values
    setTimeout(() => {
      console.log('After state update - userAnswer:', answer);
      console.log('After state update - isCorrect:', correct);
    }, 0);
  };

  const handleTrueClick = () => {
    console.log('True button clicked');
    handleAnswer(true);
  };

  const handleFalseClick = () => {
    console.log('False button clicked');
    handleAnswer(false);
  };

  const resetQuestion = () => {
    if (data) {
      const newQuestion = generateRandomQuestion(data);
      setQuestion(newQuestion);
      setUserAnswer(null);
      setIsCorrect(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
        <p className="text-slate-300 text-lg">Loading match details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <p className="text-red-300 text-xl mb-4">Error loading match</p>
        <p className="text-slate-400">{error}</p>
        <Link href="/" className="inline-block mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
  
  if (!data) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="text-slate-400 text-6xl mb-4">🔍</div>
        <p className="text-slate-300 text-xl">No data found for this match.</p>
        <Link href="/" className="inline-block mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-4 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{data.name}</h1>
          <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Match Data Section */}
          <div className="space-y-6">
            {/* Scores Card */}
            {data.scores && data.scores.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-yellow-400 mr-2">🏆</span>
                  Scores
                </h3>
                <div className="space-y-3">
                  {data.scores.map((score, idx) => (
                    <div key={idx} className="bg-slate-700/50 rounded-lg p-3">
                      <p className="text-slate-300 font-medium">{score.description}</p>
                      <p className="text-white text-lg font-bold">
                        {score.score.goals} ({score.score.participant})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events Card */}
            {data.events && data.events.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-green-400 mr-2">⚽</span>
                  Events
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.events.map((event, idx) => (
                    <div key={idx} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400 font-bold">{event.minute}'</span>
                        <span className="text-white font-medium">{event.player_name}</span>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">
                        {event.info || event.addition || event.type_id}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Statistics Card */}
            {data.statistics && data.statistics.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-blue-400 mr-2">📊</span>
                  Statistics
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {data.statistics.map((stat, idx) => (
                    <div key={idx} className="bg-slate-700/50 rounded-lg p-3">
                      <p className="text-slate-300 text-sm">Type {stat.type_id} ({stat.location})</p>
                      <p className="text-white font-bold">{stat.data.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lineups Card */}
            {data.lineups && data.lineups.length > 0 && (
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-orange-400 mr-2">👥</span>
                  Lineups
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.lineups.map((player, idx) => (
                    <div key={idx} className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{player.player_name}</span>
                        <span className="text-purple-400 font-bold">#{player.jersey_number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quiz Section */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/30">
          <h3 className="text-3xl font-bold text-white mb-6 text-center flex items-center justify-center">
            <span className="text-yellow-400 mr-3">🧠</span>
            Quiz Time!
          </h3>
          
          {question && (
            <div className="text-center">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-slate-700">
                <p className="text-white text-lg md:text-xl leading-relaxed">{question.text}</p>
              </div>
              
              {userAnswer === null ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={handleTrueClick}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/25 min-w-[120px]"
                  >
                    ✅ True
                  </button>
                  <button 
                    onClick={handleFalseClick}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 min-w-[120px]"
                  >
                    ❌ False
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`text-lg font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    You answered: <span className="text-white">{userAnswer ? 'True' : 'False'}</span>
                  </div>
                  <div className={`text-xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isCorrect ? '🎉 Correct! You get a reward.' : '😔 Incorrect. Try the next question!'}
                  </div>
                  {isCorrect && (
                    <button 
                      onClick={resetQuestion}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                    >
                      Next Question
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
