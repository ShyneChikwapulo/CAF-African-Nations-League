import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teamsAPI, tournamentAPI } from '../services/api';

interface HomeProps {
  currentUser?: any;
}

const Home: React.FC<HomeProps> = ({ currentUser }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [teamsRes, tournamentRes] = await Promise.all([
        teamsAPI.getAll(),
        tournamentAPI.getCurrent()
      ]);
      setTeams(teamsRes.data);
      setTournament(tournamentRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          African Nations League
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Experience the excitement of African football in this revolutionary tournament
        </p>
        
        <div className="flex justify-center space-x-4">
          {!currentUser ? (
            <>
              <Link
                to="/register"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Register Your Team
              </Link>
              <Link
                to="/auth"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Login
              </Link>
            </>
          ) : currentUser.role === 'representative' ? (
            <Link
              to="/dashboard"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              My Team Dashboard
            </Link>
          ) : null}
          
          <Link
            to="/tournament"
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            View Tournament
          </Link>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-blue-600">{teams.length}</div>
          <div className="text-gray-600">Registered Teams</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-green-600">
            {tournament ? 'Active' : 'Not Started'}
          </div>
          <div className="text-gray-600">Tournament Status</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">8</div>
          <div className="text-gray-600">Teams Required</div>
        </div>
      </div>

      {/* Registered Teams */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Registered Teams</h2>
        </div>
        <div className="p-6">
          {teams.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No teams registered yet. Be the first to register!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {teams.map((team) => (
                <div
                  key={team.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-lg text-gray-800">{team.country}</h3>
                  <p className="text-gray-600 text-sm">Manager: {team.manager}</p>
                  <p className="text-gray-600 text-sm">Rating: {team.averageRating}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;