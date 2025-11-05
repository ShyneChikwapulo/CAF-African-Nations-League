import React, { useState, useEffect } from 'react';
import { teamsAPI, matchesAPI, tournamentAPI, authAPI } from '../services/api';

const TeamDashboard: React.FC = () => {
  const [team, setTeam] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFormation, setSelectedFormation] = useState('4-4-2');
  const [startingXI, setStartingXI] = useState<any[]>([]);
  const [substitutions, setSubstitutions] = useState<any[]>([]);

  useEffect(() => {
    fetchTeamData();
  }, []);

  useEffect(() => {
    if (team && team.squad) {
      organizeTeamSquad();
    }
  }, [team, selectedFormation]);

  const fetchTeamData = async () => {
    try {
      // Get the current user's federation ID from localStorage or API
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      // Get current user info to find their team
      const userResponse = await authAPI.getMe();
      const currentUser = userResponse.data;
      
      if (!currentUser?.federationId) {
        console.error('No federation found for user');
        return;
      }

      // Get ALL teams to find the one that belongs to this user
      const [teamsRes, matchesRes, tournamentRes] = await Promise.all([
        teamsAPI.getAll(),
        matchesAPI.getAll(),
        tournamentAPI.getCurrent()
      ]);

      // Find the team that belongs to the current user's federation
      const userTeam = teamsRes.data.find((team: any) => 
        team.representativeId === currentUser.id
      );

      if (!userTeam) {
        console.error('No team found for current user');
        return;
      }

      setTeam(userTeam);
      setTournament(tournamentRes.data);

      // Filter matches for this specific team
      const teamMatches = matchesRes.data.filter((match: any) => 
        match.teamAId === userTeam.id || match.teamBId === userTeam.id
      );
      setMatches(teamMatches);
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

    const organizeTeamSquad = () => {
    if (!team?.squad) return;

    const squad = [...team.squad];
    
    // Sort ALL players by rating (highest first) regardless of position
    squad.sort((a, b) => {
        const ratingA = a.ratings[a.naturalPosition] || 0;
        const ratingB = b.ratings[b.naturalPosition] || 0;
        return ratingB - ratingA;
    });

    // Group players by position from the sorted list
    const goalkeepers = squad.filter(player => player.naturalPosition === 'GK');
    const defenders = squad.filter(player => ['CB', 'RB', 'LB', 'SW'].includes(player.naturalPosition));
    const midfielders = squad.filter(player => ['CM', 'CDM', 'CAM', 'RM', 'LM', 'RW', 'LW'].includes(player.naturalPosition));
    const attackers = squad.filter(player => ['ST', 'CF'].includes(player.naturalPosition));

    // Select starting XI based on formation, taking the BEST players from each position
    const formationMap: { [key: string]: { gk: number, def: number, mid: number, att: number } } = {
        '4-4-2': { gk: 1, def: 4, mid: 4, att: 2 },
        '4-3-3': { gk: 1, def: 4, mid: 3, att: 3 },
        '4-2-3-1': { gk: 1, def: 4, mid: 5, att: 1 },
        '3-5-2': { gk: 1, def: 3, mid: 5, att: 2 }
    };

    const formation = formationMap[selectedFormation];
    
    // Take the top players from each position group (they're already sorted by rating)
    const selectedStartingXI = [
        ...goalkeepers.slice(0, formation.gk),
        ...defenders.slice(0, formation.def),
        ...midfielders.slice(0, formation.mid),
        ...attackers.slice(0, formation.att)
    ];

    // If we don't have enough players for the formation, fill with best available
    if (selectedStartingXI.length < 11) {
        const remainingSpots = 11 - selectedStartingXI.length;
        const startingPlayerIds = new Set(selectedStartingXI.map(p => p.id));
        const bestRemainingPlayers = squad
        .filter(player => !startingPlayerIds.has(player.id))
        .slice(0, remainingSpots);
        
        selectedStartingXI.push(...bestRemainingPlayers);
    }

    // Add jersey numbers
    const startingXIWithNumbers = selectedStartingXI.map((player, index) => ({
        ...player,
        jerseyNumber: index + 1
    }));

    // The rest become substitutes - these should be the next best players
    const startingPlayerIds = new Set(selectedStartingXI.map(p => p.id));
    const substitutePlayers = squad
        .filter(player => !startingPlayerIds.has(player.id))
        .slice(0, 7) // Maximum 7 substitutes
        .map((player, index) => ({
        ...player,
        jerseyNumber: 12 + index
        }));

    setStartingXI(startingXIWithNumbers);
    setSubstitutions(substitutePlayers);
    };

  const getPlayerPositionsForFormation = () => {
    const formationPositions: { [key: string]: { gk: number[], def: number[], mid: number[], att: number[] } } = {
      '4-4-2': {
        gk: [1],
        def: [2, 3, 4, 5],
        mid: [6, 7, 8, 9],
        att: [10, 11]
      },
      '4-3-3': {
        gk: [1],
        def: [2, 3, 4, 5],
        mid: [6, 7, 8],
        att: [9, 10, 11]
      },
      '4-2-3-1': {
        gk: [1],
        def: [2, 3, 4, 5],
        mid: [6, 7, 8, 9, 10],
        att: [11]
      },
      '3-5-2': {
        gk: [1],
        def: [2, 3, 4],
        mid: [5, 6, 7, 8, 9],
        att: [10, 11]
      }
    };

    return formationPositions[selectedFormation] || formationPositions['4-4-2'];
  };

  const getUpcomingMatches = () => {
    return matches.filter(match => match.status === 'scheduled');
  };

  const getCompletedMatches = () => {
    return matches.filter(match => match.status === 'completed');
  };

  const getMatchResult = (match: any, teamId: string) => {
    if (match.status !== 'completed') return 'Pending';
    
    const isTeamA = match.teamAId === teamId;
    const scoreA = match.scoreA;
    const scoreB = match.scoreB;
    
    if (isTeamA) {
      return scoreA > scoreB ? 'Won' : scoreA < scoreB ? 'Lost' : 'Draw';
    } else {
      return scoreB > scoreA ? 'Won' : scoreB < scoreA ? 'Lost' : 'Draw';
    }
  };

  const getCountryFlag = (countryName: string) => {
    const flagMap: { [key: string]: string } = {
      'Nigeria': '🇳🇬', 'Egypt': '🇪🇬', 'South Africa': '🇿🇦', 'Ghana': '🇬🇭',
      'Morocco': '🇲🇦', 'Senegal': '🇸🇳', 'Ivory Coast': '🇨🇮', 'Cameroon': '🇨🇲'
    };
    return flagMap[countryName] || '🏴';
  };

  const getPositionAbbreviation = (position: string) => {
    const positionMap: { [key: string]: string } = {
      'GK': 'GK', 'CB': 'CB', 'RB': 'RB', 'LB': 'LB', 'SW': 'SW',
      'CDM': 'DM', 'CM': 'CM', 'CAM': 'AM', 'RM': 'RM', 'LM': 'LM',
      'RW': 'RW', 'LW': 'LW', 'ST': 'ST', 'CF': 'CF'
    };
    return positionMap[position] || position;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading team dashboard...</div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">No Team Found</h2>
          <p className="text-gray-600">Please register a team to access the dashboard.</p>
        </div>
      </div>
    );
  }

  const positions = getPlayerPositionsForFormation();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Team Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-6xl">{getCountryFlag(team.country)}</div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">{team.country}</h1>
              <p className="text-xl text-gray-600">Manager: {team.manager}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
                  Rating: {team.averageRating}
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                  {team.squad.length} Players
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Tournament Status</div>
            <div className="text-lg font-semibold text-gray-800">
              {tournament ? tournament.currentRound : 'No Active Tournament'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Starting XI & Formation Section */}
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <div className="px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Starting XI & Formation</h2>
            <select 
              value={selectedFormation} 
              onChange={(e) => setSelectedFormation(e.target.value)}
              className="border rounded px-3 py-1"
            >
              <option value="4-4-2">4-4-2</option>
              <option value="4-3-3">4-3-3</option>
              <option value="4-2-3-1">4-2-3-1</option>
              <option value="3-5-2">3-5-2</option>
            </select>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Starting XI List */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4 text-center">STARTING XI</h3>
                  <div className="space-y-2">
                    {startingXI.map((player) => (
                      <div key={player.id} className="flex items-center justify-between py-2 border-b">
                        <span className="font-semibold w-8">{player.jerseyNumber}.</span>
                        <span className="flex-1 text-sm">{player.name}</span>
                        <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                          {getPositionAbbreviation(player.naturalPosition)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-bold mb-2">SUBSTITUTIONS</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {substitutions.map((player) => (
                        <div key={player.id} className="text-sm">
                          {player.jerseyNumber}. {player.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Football Field Visualization */}
              <div className="lg:col-span-2">
                <div className="bg-green-600 rounded-lg p-4 relative h-96">
                  {/* Football Field */}
                  <div className="absolute inset-4 border-2 border-white rounded-lg flex flex-col justify-between">
                    {/* Center circle */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white rounded-full"></div>
                    {/* Center line */}
                    <div className="absolute top-1/2 left-0 right-0 border-t-2 border-white"></div>
                    
                    {/* Players positioned based on formation */}
                    <div className="absolute inset-0 p-4">
                      {/* Goalkeeper */}
                      {positions.gk.map((number, index) => {
                        const player = startingXI.find(p => p.jerseyNumber === number);
                        return (
                          <div key={number} className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                            <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xs font-bold shadow-lg">
                              {player ? number : number}
                            </div>
                            {player && (
                              <div className="text-xs text-white text-center mt-1 font-semibold bg-black bg-opacity-50 px-1 rounded">
                                {player.name.split(' ').pop()}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Defenders */}
                      <div className="absolute bottom-16 left-0 right-0 flex justify-around">
                        {positions.def.map((number) => {
                          const player = startingXI.find(p => p.jerseyNumber === number);
                          return (
                            <div key={number} className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold shadow-lg">
                              {player ? number : number}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Midfielders */}
                      <div className="absolute bottom-32 left-0 right-0 flex justify-around">
                        {positions.mid.map((number) => {
                          const player = startingXI.find(p => p.jerseyNumber === number);
                          return (
                            <div key={number} className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold shadow-lg">
                              {player ? number : number}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Attackers */}
                      <div className="absolute bottom-48 left-0 right-0 flex justify-around">
                        {positions.att.map((number) => {
                          const player = startingXI.find(p => p.jerseyNumber === number);
                          return (
                            <div key={number} className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-xs font-bold shadow-lg">
                              {player ? number : number}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-600">
                  Formation: {selectedFormation} • {startingXI.length}/11 Players Selected
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Squad Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">Full Squad</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {team.squad.map((player: any) => {
                const isStarting = startingXI.some(p => p.id === player.id);
                const isSubstitute = substitutions.some(p => p.id === player.id);
                
                return (
                  <div 
                    key={player.id} 
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      isStarting ? 'bg-blue-50 border-blue-200' : 
                      isSubstitute ? 'bg-green-50 border-green-200' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                        {getPositionAbbreviation(player.naturalPosition)}
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{player.name}</div>
                        <div className="text-sm text-gray-600">
                          {player.isCaptain && '👑 '}Natural {player.naturalPosition}
                          {isStarting && ' • Starting'}
                          {isSubstitute && ' • Substitute'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">
                        {player.ratings[player.naturalPosition]}
                      </div>
                      <div className="text-xs text-gray-500">Rating</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">Upcoming Matches</h2>
          </div>
          <div className="p-6">
            {getUpcomingMatches().length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No upcoming matches scheduled
              </div>
            ) : (
              <div className="space-y-4">
                {getUpcomingMatches().map((match) => (
                  <div key={match.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="text-center flex-1">
                        <div className="font-semibold">{match.teamAName}</div>
                        <div className="text-2xl">{getCountryFlag(match.teamAName)}</div>
                      </div>
                      <div className="text-center mx-4">
                        <div className="text-sm text-gray-500">VS</div>
                        <div className="text-xs text-gray-400 capitalize">{match.round}</div>
                      </div>
                      <div className="text-center flex-1">
                        <div className="font-semibold">{match.teamBName}</div>
                        <div className="text-2xl">{getCountryFlag(match.teamBName)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Match History */}
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <div className="px-6 py-4 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">Match History</h2>
          </div>
          <div className="p-6">
            {getCompletedMatches().length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No matches played yet
              </div>
            ) : (
              <div className="space-y-3">
                {getCompletedMatches().map((match) => {
                  const isTeamA = match.teamAId === team.id;
                  const opponent = isTeamA ? match.teamBName : match.teamAName;
                  const result = getMatchResult(match, team.id);
                  const resultColor = result === 'Won' ? 'text-green-600' : 
                                   result === 'Lost' ? 'text-red-600' : 'text-yellow-600';

                  return (
                    <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white ${
                          result === 'Won' ? 'bg-green-500' : 
                          result === 'Lost' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}>
                          {result.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-lg">
                            vs {opponent} {getCountryFlag(opponent)}
                          </div>
                          <div className="text-sm text-gray-600 capitalize">
                            {match.round} • {new Date(match.completedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">
                          {isTeamA ? `${match.scoreA}-${match.scoreB}` : `${match.scoreB}-${match.scoreA}`}
                        </div>
                        <div className={`font-semibold ${resultColor}`}>
                          {result}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Team Statistics */}
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <div className="px-6 py-4 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">Team Statistics</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{getCompletedMatches().length}</div>
                <div className="text-gray-600">Matches Played</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {getCompletedMatches().filter(m => getMatchResult(m, team.id) === 'Won').length}
                </div>
                <div className="text-gray-600">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {getCompletedMatches().filter(m => getMatchResult(m, team.id) === 'Lost').length}
                </div>
                <div className="text-gray-600">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {getCompletedMatches().filter(m => getMatchResult(m, team.id) === 'Draw').length}
                </div>
                <div className="text-gray-600">Draws</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;