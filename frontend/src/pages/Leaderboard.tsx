import React, { useEffect, useState } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import ScoreChart from '../components/ScoreChart';
import TeamFilters from '../components/TeamFilters';
import RankingTable from '../components/RankingTable';
import { useScoreboard } from '../hooks/useScoreboard';

const Leaderboard: React.FC = () => {
  const { teams, isLoading: loading, error } = useScoreboard();
  const [visibleTeams, setVisibleTeams] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (teams.length > 0) {
      // Only show top 10 initially and in filters
      const top10 = teams.slice(0, 10);
      const top10Names = new Set(top10.map(t => t.name));
      setVisibleTeams(top10Names);
    }
  }, [teams]);

  const toggleTeam = (teamName: string) => {
    setVisibleTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamName)) {
        newSet.delete(teamName);
      } else {
        newSet.add(teamName);
      }
      return newSet;
    });
  };

  // Derived state for top 10 teams to be used in Chart and Filters
  const topTeams = teams.slice(0, 10);

  return (
    <div className="flex min-h-screen flex-col bg-base-100 text-white">
      <Navigation />

      <main className="flex-1 bg-base-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12">
          
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
            <p className="mt-2 text-white/60">Live rankings and score progression for all teams</p>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-error/20 bg-error/10 p-6 text-center text-error">
              Error: {error}
            </div>
          ) : (
            <>
              <ScoreChart teams={topTeams} visibleTeams={visibleTeams} />
              
              <TeamFilters 
                teams={topTeams.map(t => ({ id: t.id, name: t.name }))} 
                visibleTeams={visibleTeams} 
                toggleTeam={toggleTeam} 
              />

              <RankingTable teams={teams} />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Leaderboard;
