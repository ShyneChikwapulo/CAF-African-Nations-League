import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teamsAPI, tournamentAPI, matchesAPI, seedAPI } from '../services/api';



const AdminPanel: React.FC = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [tournament, setTournament] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');


  useEffect(() => {
    fetchData();
  }, []);






const handleSeedData = async () => {
  if (!window.confirm('This will create 7 demo teams. Are you sure?')) {
    return;
  }

  setSeedLoading(true);
  setSeedMessage('');
  
  try {
    const response = await seedAPI.seedData();
    setSeedMessage(response.data.message);
    // Refresh teams list
    fetchData();
  } catch (error: any) {
    setSeedMessage(error.response?.data?.error || 'Failed to create demo teams');
  } finally {
    setSeedLoading(false);
  }
};

//detect tournament completion and redirect
useEffect(() => {
  if (tournament?.currentRound === 'completed' && tournament?.winner) {
    console.log('🏆 Tournament completed! Redirecting to winner page...');
    // Redirect to winner page after a short delay
    const timer = setTimeout(() => {
      window.location.href = `/winner`;
    }, 2000);
    return () => clearTimeout(timer);
  }
}, [tournament]); // This will trigger when tournament changes to completed

  const fetchData = async () => {
    try {
      const [teamsRes, tournamentRes, matchesRes] = await Promise.all([
        teamsAPI.getAll(),
        tournamentAPI.getCurrent(),
        matchesAPI.getAll()
      ]);
      
      setTeams(teamsRes.data);
      setTournament(tournamentRes.data);
      setMatches(matchesRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelection = (teamId: string) => {
    setSelectedTeams(prev => {
      if (prev.includes(teamId)) {
        return prev.filter(id => id !== teamId);
      } else if (prev.length < 8) {
        return [...prev, teamId];
      }
      return prev;
    });
  };

  const handleCreateTournament = async () => {
    if (selectedTeams.length !== 8) {
      alert('Please select exactly 8 teams for the tournament');
      return;
    }

    setActionLoading('create');
    try {
      await tournamentAPI.create({ teamIds: selectedTeams });
      alert('Tournament created successfully!');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create tournament');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePlayMatch = async (matchId: string, matchType: 'played' | 'simulated') => {
    const actionKey = `${matchType}-${matchId}`;
    setActionLoading(actionKey);
    try {
      await tournamentAPI.playMatch(matchId, matchType);
      alert(`Match ${matchType === 'played' ? 'played with AI commentary' : 'simulated'} successfully! Check emails for notifications.`);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || `Failed to ${matchType} match`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetTournament = async () => {
    if (!window.confirm('Are you sure you want to reset the tournament? This will deactivate the current tournament.')) {
      return;
    }

    setActionLoading('reset');
    try {
      await tournamentAPI.reset();
      alert('Tournament reset successfully!');
      fetchData();
      setSelectedTeams([]);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reset tournament');
    } finally {
      setActionLoading(null);
    }
  };

  const getTournamentMatches = () => {
    if (!tournament) return [];
    return matches.filter(match => match.tournamentId === tournament.id);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading admin data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Winner Notification Banner */}
      {tournament?.currentRound === 'completed' && tournament?.winner && (
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 mb-8 text-center text-white animate-pulse">
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="text-2xl font-bold mb-2">Tournament Complete!</h3>
          <p className="text-xl mb-4">Champion: {tournament.winner}</p>
          <div className="flex justify-center space-x-4">
            <Link 
              to="/winner"
              state={{ tournament }}
              className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition-colors"
            >
              🎉 View Celebration
            </Link>
            <Link 
              to="/tournament"
              className="bg-transparent border-2 border-white text-white hover:bg-white/20 px-6 py-3 rounded-lg font-bold transition-colors"
            >
              📊 View Bracket
            </Link>
          </div>
        </div>
      )}
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Admin Panel</h1>
      {/* Seed Data Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Quick Setup
        </h2>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Demo Data Instructions</h3>
          <p className="text-yellow-700 text-sm">
            • Creates 7 pre-made teams with realistic African player names<br/>
            • You'll need to register the 8th team manually - I would suggest using SA<br/>
            • Perfect for testing and demonstrations
          </p>
        </div>

        <button
          onClick={handleSeedData}
          disabled={seedLoading || teams.length >= 7}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 mb-4"
        >
          {seedLoading ? 'Creating Demo Teams...' : '🎲 Generate Demo Teams (7)'}
        </button>

        {seedMessage && (
          <div className={`p-3 rounded-lg text-center ${
            seedMessage.includes('successfully') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {seedMessage}
          </div>
        )}

        {teams.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            <strong>Current teams in system:</strong> {teams.length}
            {teams.length >= 7 && (
              <span className="ml-2 text-green-600 font-semibold">
                ✓ Ready for tournament creation!
              </span>
            )}
          </div>
        )}
      </div>      

        {tournament?.currentRound === 'completed' && (
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 mb-8 text-center text-white">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-2xl font-bold mb-2">Tournament Complete!</h3>
            <p className="text-xl mb-4">
              {tournament.winner ? `Champion: ${tournament.winner}` : 'Tournament Finished'}
            </p>
            <Link 
              to="/winner"
              className="bg-white text-green-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition-colors inline-block"
            >
              View Celebration
            </Link>
          </div>
        )}      

      {/* Tournament Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Tournament Setup
          </h2>
          
          {!tournament ? (
            <>
              <p className="text-gray-600 mb-4">
                Select 8 teams to start the tournament. {teams.length} teams available.
              </p>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Selected: {selectedTeams.length}/8 teams
                  </span>
                  {selectedTeams.length === 8 && (
                    <span className="text-green-600 text-sm font-semibold">Ready to create tournament</span>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2 mb-4">
                {teams.map(team => (
                  <div
                    key={team.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTeams.includes(team.id)
                        ? 'bg-blue-50 border-blue-500'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleTeamSelection(team.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{team.country}</div>
                        <div className="text-sm text-gray-600">
                          Manager: {team.manager} | Rating: {team.averageRating}
                        </div>
                      </div>
                      {selectedTeams.includes(team.id) && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCreateTournament}
                disabled={selectedTeams.length !== 8 || actionLoading === 'create'}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {actionLoading === 'create' ? 'Creating Tournament...' : 'Create Tournament'}
              </button>
            </>
          ) : (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-green-800">Tournament Active</h3>
                <p className="text-green-700">
                  Current round: <strong>{tournament.currentRound}</strong>
                </p>
                <p className="text-green-700">
                  {getTournamentMatches().filter((m: any) => m.status === 'completed').length} of{' '}
                  {getTournamentMatches().length} matches completed
                </p>
              </div>

              <button
                onClick={handleResetTournament}
                disabled={actionLoading === 'reset'}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {actionLoading === 'reset' ? 'Resetting...' : 'Reset Tournament'}
              </button>
            </div>
          )}
        </div>

        {/* Match Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Match Management
          </h2>

          {!tournament ? (
            <div className="text-center text-gray-500 py-8">
              Create a tournament first to manage matches
            </div>
          ) : (
            <div className="space-y-4">
              {getTournamentMatches().map((match) => (
                <div key={match.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">
                        {match.teamAName} vs {match.teamBName}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {match.round} • {match.status}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 rounded text-xs ${
                        match.status === 'completed' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                      }`}>
                        {match.status}
                      </span>
                      {match.status === 'completed' && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          match.matchType === 'played' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {match.matchType === 'played' ? 'AI Played' : 'Simulated'}
                        </span>
                      )}
                    </div>
                  </div>

                  {match.status === 'completed' ? (
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        {match.scoreA} - {match.scoreB}
                      </div>
                      <div className="text-sm text-gray-600">
                        {match.matchType === 'played' ? 'Full AI commentary generated' : 'Basic simulation completed'}
                      </div>
                      {match.goalScorers && match.goalScorers.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          Goals: {match.goalScorers.map((gs: any) => 
                            `${gs.playerName} (${gs.minute}')`
                          ).join(', ')}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 mb-2">
                        Choose how to play this match:
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePlayMatch(match.id, 'simulated')}
                          disabled={actionLoading === `simulated-${match.id}`}
                          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm transition-colors disabled:opacity-50"
                          title="Fast simulation with basic results"
                        >
                          {actionLoading === `simulated-${match.id}` ? 'Simulating...' : 'Simulate'}
                        </button>
                        <button
                          onClick={() => handlePlayMatch(match.id, 'played')}
                          disabled={actionLoading === `played-${match.id}`}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm transition-colors disabled:opacity-50"
                          title="Full AI commentary with detailed match events"
                        >
                          {actionLoading === `played-${match.id}` ? 'Playing...' : 'Play with AI'}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 flex justify-between">
                        <span>⚡ Fast simulation</span>
                        <span>🤖 AI commentary</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Match Types Explained</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-700">🎮 Simulated Match</h4>
            <ul className="text-sm text-blue-600 list-disc list-inside">
              <li>Fast processing</li>
              <li>Basic final score and goal scorers</li>
              <li>No detailed commentary</li>
              <li>Ideal for quick tournament progression</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700">🤖 Played Match (AI)</h4>
            <ul className="text-sm text-blue-600 list-disc list-inside">
              <li>AI-generated match commentary</li>
              <li>Detailed match events and progression</li>
              <li>Slower processing (uses OpenAI API)</li>
              <li>Immersive match experience</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;