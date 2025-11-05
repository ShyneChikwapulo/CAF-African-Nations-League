import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tournamentAPI, matchesAPI } from '../services/api';

const Tournament: React.FC = () => {
  const [tournament, setTournament] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [goalScorers, setGoalScorers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournamentData();
  }, []);

// auto-refresh:
useEffect(() => {
  const interval = setInterval(() => {
    // ALWAYS refresh, even if tournament is completed, to detect completion
    fetchTournamentData();
  }, 5000); // Refresh every 5 seconds

  return () => clearInterval(interval);
}, []); // Remove tournament from dependencies

//auto-redirect when tournament completes
useEffect(() => {
  if (tournament?.currentRound === 'completed' && tournament?.winner) {
    console.log('🏆 Tournament completed! Auto-redirecting to winner page...');
    // Auto-redirect after 3 seconds to let user see the completion
    const timer = setTimeout(() => {
      // Use navigate instead of window.location to preserve state
      window.location.href = `/winner`;
    }, 3000);
    return () => clearTimeout(timer);
  }
}, [tournament]);

  const fetchTournamentData = async () => {
    try {
      const [tournamentRes, matchesRes] = await Promise.all([
        tournamentAPI.getCurrent(),
        matchesAPI.getAll()
      ]);
      
      setTournament(tournamentRes.data);
      setMatches(matchesRes.data);
      
      // Fetch goal scorers for current tournament
      if (tournamentRes.data) {
        const scorersRes = await matchesAPI.getGoalScorers(tournamentRes.data.id);
        setGoalScorers(scorersRes.data);
      }
    } catch (error) {
      console.error('Error fetching tournament data:', error);
    } finally {
      setLoading(false);
    }
  };

  
  const renderBracket = () => {
    if (!tournament) return null;

    const getRoundMatches = (round: string) => {
      return matches.filter(match => match.round === round && match.tournamentId === tournament?.id);
    };

    const quarters = getRoundMatches('quarterfinal');
    const semis = getRoundMatches('semifinal');
    const final = getRoundMatches('final')[0];

    const MatchCard: React.FC<{ match: any }> = ({ match }) => {
      const isCompleted = match.status === 'completed';

      return (
        <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
          <Link to={`/match/${match.id}`}>
            <div className="text-center mb-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                match.round === 'final' ? 'bg-yellow-500 text-white' :
                match.round === 'semifinal' ? 'bg-purple-500 text-white' :
                'bg-blue-500 text-white'
              }`}>
                {match.round}
              </span>
              {match.matchType === 'played' && (
                <span className="ml-2 px-2 py-1 bg-green-500 text-white rounded text-xs">Played</span>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm font-semibold flex-1 text-right pr-2">
                {match.teamAName}
              </div>
              
              <div className="flex items-center space-x-2">
                {isCompleted ? (
                  <>
                    <div className="text-lg font-bold">{match.scoreA}</div>
                    <div className="text-gray-400">-</div>
                    <div className="text-lg font-bold">{match.scoreB}</div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">VS</div>
                )}
              </div>
              
              <div className="text-sm font-semibold flex-1 pl-2">
                {match.teamBName}
              </div>
            </div>

            {isCompleted && match.goalScorers.length > 0 && (
              <div className="mt-2 text-xs text-gray-600 text-center">
                {match.goalScorers.slice(0, 2).map((scorer: any) => (
                  <div key={`${scorer.playerId}-${scorer.minute}`}>
                    {scorer.minute}' {scorer.playerName}
                  </div>
                ))}
                {match.goalScorers.length > 2 && (
                  <div>+{match.goalScorers.length - 2} more</div>
                )}
              </div>
            )}
          </Link>
        </div>
      );
    };

    return (
      <div className="tournament-bracket p-8 rounded-lg">
        <div className="flex justify-between items-start">
          {/* Quarter Finals */}
          <div className="w-1/4">
            <h3 className="text-white font-bold mb-4 text-center">Quarter Finals</h3>
            <div className="space-y-4">
              {quarters.map((match, index) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>

          {/* Semi Finals */}
          <div className="w-1/4 mt-16">
            <h3 className="text-white font-bold mb-4 text-center">Semi Finals</h3>
            <div className="space-y-16">
              {semis.map((match, index) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>

          {/* Final */}
          <div className="w-1/4 mt-32">
            <h3 className="text-white font-bold mb-4 text-center">Final</h3>
            {final && <MatchCard key={final.id} match={final} />}
            
            {tournament.winner && (
              <div className="bg-yellow-500 text-white p-4 rounded-lg mt-4 text-center">
                <div className="text-lg font-bold">🏆 Champion</div>
                <div className="text-xl">{tournament.winner}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  //CHECK FOR COMPLETED TOURNAMENT
  if (tournament?.currentRound === 'completed') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8 text-center">
            {/* Add refresh button */}
            <div className="mb-4">
              <button 
                onClick={fetchTournamentData}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                🔄 Refresh
              </button>
            </div>          
          {/* Winner Banner */}
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-8 mb-8 shadow-2xl">
            <div className="text-6xl mb-4">🏆</div>
            <h1 className="text-4xl font-bold text-white mb-2">Tournament Complete!</h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {tournament.winner ? `Champion: ${tournament.winner}` : 'Tournament Finished'}
            </h2>
              <Link 
                to="/winner"
                state={{ tournament }}
                className="bg-white text-yellow-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 inline-block"
                onClick={(e) => {
                  console.log('Navigating to winner page with tournament:', tournament);
                }}
              >
                🎉 View Celebration
              </Link>
          </div>
          
          {/* Keep showing the tournament bracket */}
          {renderBracket()}
          
          {/* Goal Scorers Leaderboard */}
          <div className="bg-white rounded-lg shadow mt-8">
            <div className="px-6 py-4 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">Goal Scorers Leaderboard</h2>
            </div>
            <div className="p-6">
              {goalScorers.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  No goals scored in the tournament.
                </div>
              ) : (
                <div className="space-y-2">
                  {goalScorers.map((scorer, index) => (
                    <div key={scorer.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{scorer.playerName}</div>
                          <div className="text-sm text-gray-600">{scorer.teamName}</div>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {scorer.goals} {scorer.goals === 1 ? 'goal' : 'goals'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  //LOADING AND NO TOURNAMENT CHECKS
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading tournament data...</div>
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No Active Tournament</h2>
          <p className="text-gray-600 mb-8">
            There is no active tournament currently. An administrator can start a tournament when 8 teams are registered.
          </p>
          <Link
            to="/admin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Go to Admin Panel
          </Link>
        </div>
      </div>
    );
  }

  //REGULAR TOURNAMENT VIEW
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Tournament Bracket</h1>
          <p className="text-gray-600">African Nations League - {tournament.currentRound}</p>
        </div>

        {renderBracket()}

        {/* Goal Scorers Leaderboard */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="px-6 py-4 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">Goal Scorers Leaderboard</h2>
          </div>
          <div className="p-6">
            {goalScorers.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                No goals scored yet in the tournament.
              </div>
            ) : (
              <div className="space-y-2">
                {goalScorers.map((scorer, index) => (
                  <div key={scorer.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{scorer.playerName}</div>
                        <div className="text-sm text-gray-600">{scorer.teamName}</div>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {scorer.goals} {scorer.goals === 1 ? 'goal' : 'goals'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tournament;