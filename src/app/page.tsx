'use client';

import { useQuizStore } from '@/store/quizStore';
import React from 'react';
import { fetchLiveFixtures } from '@/utils/api';
import Link from 'next/link';

export default function HomePage() {
  const [liveMatches, setLiveMatches] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const getLiveMatches = async () => {
      try {
        const data = await fetchLiveFixtures();
        // Adjust this according to the actual API response structure
        setLiveMatches(data.data || []);
      } catch (error) {
        console.error('Error fetching live matches:', error);
      } finally {
        setLoading(false);
      }
    };
    getLiveMatches();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Mind Match
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
            Test your football knowledge with live match predictions and trivia
          </p>
        </div>

        {/* Live Matches Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Live Matches
          </h2>
          
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            </div>
          )}
          
          {!loading && liveMatches.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto border border-slate-700">
                <div className="text-slate-400 text-6xl mb-4">⚽</div>
                <p className="text-slate-300 text-lg">No live matches right now.</p>
                <p className="text-slate-500 text-sm mt-2">Check back later for exciting matchups!</p>
              </div>
            </div>
          )}
          
          {!loading && liveMatches.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveMatches.map((match: any) => (
                <div key={match.id} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider">Live</span>
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">
                    {match.participants?.map((p: any) => p.name).join(' vs ')}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Match ID: {match.id}</span>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Featured Match Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-8 border border-purple-500/30 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Featured Match</h3>
            <p className="text-slate-300 mb-6">Experience the excitement of Celtic vs Rangers</p>
            <Link 
              href="/match/18535517/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <span>View Match Details</span>
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

