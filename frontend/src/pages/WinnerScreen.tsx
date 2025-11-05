import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { tournamentAPI } from '../services/api';


const WinnerScreen: React.FC = () => {
  const location = useLocation();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add debugging
  console.log('WinnerScreen rendered with location state:', location.state);
  console.log('Tournament data:', tournament);


    useEffect(() => {
    const fetchTournamentData = async () => {
        try {
        // First i'll try to get tournament from location state
        if (location.state?.tournament) {
            setTournament(location.state.tournament);
            setLoading(false);
            return;
        }

        // If no state, fetch the current tournament
        const tournamentRes = await tournamentAPI.getCurrent();
        if (tournamentRes.data && tournamentRes.data.currentRound === 'completed') {
            setTournament(tournamentRes.data);
        }
        } catch (error) {
        console.error('Error fetching tournament data:', error);
        } finally {
        setLoading(false);
        }
    };

    fetchTournamentData();
    }, [location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading celebration...</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-4">No Tournament Data</h1>
          <p className="mb-4">Could not find completed tournament data.</p>
          <Link 
            to="/tournament"
            className="bg-white text-purple-900 hover:bg-gray-100 px-6 py-3 rounded-lg font-bold transition-colors"
          >
            Back to Tournament
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-800 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Confetti elements remain the same */}
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        <div className="confetti"></div>
        
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
        <div className="star"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 text-center text-white">
        {/* Trophy Icon */}
        <div className="mb-8 animate-bounce">
          <div className="text-8xl mb-4">🏆</div>
        </div>

        {/* Champion Announcement - Now using actual tournament data */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">
            CHAMPIONS!
          </h1>
          <div className="text-4xl md:text-6xl font-bold mb-2">
            {tournament?.winner || 'Tournament Winner'}
          </div>
          <div className="text-xl md:text-2xl text-yellow-300">
            African Nations League Champion
          </div>
          {tournament?.completedAt && (
            <div className="text-lg text-yellow-200 mt-2">
              {new Date(tournament.completedAt).toLocaleDateString()}
            </div>
          )}
        </div>

        {/* Tournament Stats - Updated with real data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-yellow-400">
              {tournament?.teams?.length || 8}
            </div>
            <div className="text-lg">Teams Competed</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-yellow-400">7</div>
            <div className="text-lg">Matches Played</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-3xl font-bold text-yellow-400">1</div>
            <div className="text-lg">Champion Crowned</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/tournament" 
            className="bg-white text-purple-900 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl"
          >
            📊 View Tournament Bracket
          </Link>
          
          <Link 
            to="/admin" 
            className="bg-yellow-500 text-purple-900 hover:bg-yellow-400 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl"
          >
            🔄 New Tournament
          </Link>
          
          <Link 
            to="/" 
            className="bg-transparent border-2 border-white text-white hover:bg-white/20 px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105"
          >
            🏠 Back to Home
          </Link>
        </div>

        {/* Celebration Message */}
        <div className="mt-12 text-yellow-200 text-lg italic max-w-2xl mx-auto">
          "A magnificent victory in the heart of African football! {tournament?.winner ? `Congratulations to ${tournament.winner}` : 'Congratulations to the champion'} for an incredible tournament performance."
        </div>
      </div>

      {/* CSS for animations (keep the same) */}
      <style>{`
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #ffd700;
          top: -10px;
          animation: confetti-fall 3s linear infinite;
        }
        
        .confetti:nth-child(1) { left: 10%; animation-delay: 0s; background: #ff0000; }
        .confetti:nth-child(2) { left: 20%; animation-delay: 0.5s; background: #00ff00; }
        .confetti:nth-child(3) { left: 30%; animation-delay: 1s; background: #0000ff; }
        .confetti:nth-child(4) { left: 40%; animation-delay: 1.5s; background: #ffff00; }
        .confetti:nth-child(5) { left: 50%; animation-delay: 2s; background: #ff00ff; }
        .confetti:nth-child(6) { left: 60%; animation-delay: 2.5s; background: #00ffff; }
        .confetti:nth-child(7) { left: 70%; animation-delay: 0.2s; background: #ffa500; }
        .confetti:nth-child(8) { left: 80%; animation-delay: 0.8s; background: #800080; }
        
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        
        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle 3s infinite;
        }
        
        .star:nth-child(1) { width: 3px; height: 3px; top: 20%; left: 10%; animation-delay: 0s; }
        .star:nth-child(2) { width: 2px; height: 2px; top: 60%; left: 80%; animation-delay: 1s; }
        .star:nth-child(3) { width: 4px; height: 4px; top: 40%; left: 40%; animation-delay: 2s; }
        .star:nth-child(4) { width: 3px; height: 3px; top: 80%; left: 30%; animation-delay: 1.5s; }
        .star:nth-child(5) { width: 2px; height: 2px; top: 30%; left: 70%; animation-delay: 0.5s; }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default WinnerScreen;