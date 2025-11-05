import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { matchesAPI } from '../services/api';

const MatchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchDetails();
  }, [id]);

  const fetchMatchDetails = async () => {
    try {
      const response = await matchesAPI.getById(id!);
      setMatch(response.data);
    } catch (error) {
      console.error('Error fetching match details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading match details...</div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Match Not Found</h2>
          <Link to="/tournament" className="text-blue-600 hover:text-blue-800">
            Back to Tournament
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link 
        to="/tournament" 
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        ← Back to Tournament
      </Link>

      {/* Match Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center mb-6">
          <div className="flex justify-center space-x-4 mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              match.round === 'final' ? 'bg-yellow-500 text-white' :
              match.round === 'semifinal' ? 'bg-purple-500 text-white' :
              'bg-blue-500 text-white'
            }`}>
              {match.round}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              match.matchType === 'played' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
            }`}>
              {match.matchType === 'played' ? 'AI Played Match' : 'Simulated Match'}
            </span>
            <span className="px-3 py-1 bg-gray-200 rounded-full text-sm font-semibold">
              {match.status}
            </span>
          </div>

          <div className="flex justify-center items-center space-x-8 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{match.teamAName}</div>
            </div>
            
            <div className="text-center">
              {match.status === 'completed' ? (
                <div className="text-4xl font-bold">
                  {match.scoreA} - {match.scoreB}
                </div>
              ) : (
                <div className="text-2xl text-gray-500">VS</div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">{match.teamBName}</div>
            </div>
          </div>

          {match.status === 'completed' && (
            <div className="text-lg text-gray-600">
              Match Completed • {new Date(match.completedAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Goal Scorers */}
        {match.goalScorers.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4">Goal Scorers</h3>
            <div className="space-y-2">
              {match.goalScorers.map((scorer: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                      ⚽
                    </div>
                    <div>
                      <div className="font-semibold">{scorer.playerName}</div>
                      <div className="text-sm text-gray-600">
                        {scorer.teamId === match.teamAId ? match.teamAName : match.teamBName}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-700">
                    {scorer.minute}'
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Match Commentary */}
      {match.matchType === 'played' && match.commentary && match.commentary.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-semibold mb-6 text-center">Match Commentary</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {match.commentary.map((comment: string, index: number) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <p className="text-gray-800">{comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {match.matchType === 'simulated' && match.status === 'completed' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold text-yellow-800 mb-2">Simulated Match</h3>
          <p className="text-yellow-700">
            This match was simulated. No AI commentary is available for simulated matches.
          </p>
        </div>
      )}
    </div>
  );
};

export default MatchDetails;