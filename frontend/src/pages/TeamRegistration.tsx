import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, teamsAPI } from '../services/api';

interface TeamRegistrationProps {
  onSwitchToLogin?: () => void;
}

const TeamRegistration: React.FC<TeamRegistrationProps> = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    manager: '',
    federationName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const africanCountries = [
    'Nigeria', 'Egypt', 'South Africa', 'Ghana', 'Morocco', 'Senegal', 'Ivory Coast',
    'Cameroon', 'Algeria', 'Tunisia', 'Kenya', 'Ethiopia', 'DR Congo', 'Tanzania',
    'Uganda', 'Zambia', 'Zimbabwe', 'Mali', 'Burkina Faso', 'Angola'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Register user
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        country: formData.country,
        manager: formData.manager,
        federationName: formData.federationName
      });
      
      // Store token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.role);
      
      setStep(2);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Register team
      await teamsAPI.register({
        country: formData.country,
        manager: formData.manager
      });
      
      alert('Team registered successfully!');
      navigate('/');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Team registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Team Registration
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleStep1Submit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Federation Name
                </label>
                <input
                  type="text"
                  name="federationName"
                  value={formData.federationName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter federation name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select your country</option>
                  {africanCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager Name
                </label>
                <input
                  type="text"
                  name="manager"
                  value={formData.manager}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter manager's name"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Registering...' : 'Continue to Team Setup'}
              </button>

              {onSwitchToLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={onSwitchToLogin}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Already have an account? Login
                  </button>
                </div>
              )}
            </div>
          </form>
        )}

        {step === 2 && (
          <div>
            <div className="bg-green-50 border border-green-200 rounded-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Federation Representative Registered!
              </h3>
              <p className="text-green-700">
                Your federation account has been created. Now let's set up your team with a
                randomly generated squad of 23 players.
              </p>
            </div>

            <div className="bg-gray-50 rounded-md p-6 mb-6">
              <h4 className="font-semibold text-gray-800 mb-2">Registration Details:</h4>
              <p><strong>Federation:</strong> {formData.federationName}</p>
              <p><strong>Country:</strong> {formData.country}</p>
              <p><strong>Manager:</strong> {formData.manager}</p>
              <p><strong>Email:</strong> {formData.email}</p>
            </div>

            <form onSubmit={handleStep2Submit}>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Your team will be automatically generated with 23 players including:
                  3 Goalkeepers, 8 Defenders, 8 Midfielders, and 4 Attackers. 
                  Player ratings will be randomly assigned based on their natural positions.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-md font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating Team...' : 'Complete Registration & Generate Team'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamRegistration;