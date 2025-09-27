import React, { useState } from 'react';
import { MapPin, User, Loader2, AlertCircle } from 'lucide-react';
import { getCurrentLocation, saveLocationToStorage, saveUserSession } from '../utils/geolocation';
import { fetchWeatherByCity } from '../utils/weatherApi';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  const handleAutoLocation = async () => {
    if (!username.trim()) {
      alert('Please enter your username first');
      return;
    }

    setIsLoading(true);
    setLocationError('');

    try {
      const location = await getCurrentLocation();
      saveLocationToStorage(location);
      saveUserSession(username);
      onLogin(username);
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Failed to get location');
      setShowManualInput(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualLocation = async () => {
    if (!username.trim()) {
      alert('Please enter your username first');
      return;
    }

    if (!manualLocation.trim()) {
      alert('Please enter a city name or pincode');
      return;
    }

    setIsLoading(true);
    setLocationError('');

    try {
      // Validate location by fetching weather data
      const weatherData = await fetchWeatherByCity(manualLocation);
      
      const location = {
        latitude: weatherData.location.lat,
        longitude: weatherData.location.lon,
        city: weatherData.location.name,
        country: weatherData.location.country,
      };

      saveLocationToStorage(location);
      saveUserSession(username);
      onLogin(username);
    } catch (error) {
      setLocationError('Invalid location. Please try a different city name or pincode.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weather Dashboard</h1>
          <p className="text-gray-600">Get personalized weather updates for your location</p>
        </div>

        <div className="space-y-6">
          {/* Username Input */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Auto Location Button */}
          <button
            onClick={handleAutoLocation}
            disabled={isLoading || !username.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MapPin className="h-5 w-5" />
            )}
            <span>{isLoading ? 'Detecting Location...' : 'Auto-Detect My Location'}</span>
          </button>

          {/* Error Message */}
          {locationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 text-sm font-medium">Location Error</p>
                <p className="text-red-700 text-sm">{locationError}</p>
              </div>
            </div>
          )}

          {/* Manual Location Input */}
          {(showManualInput || locationError) && (
            <div className="border-t pt-6">
              <p className="text-center text-gray-600 mb-4">Or enter your location manually:</p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city name or pincode (e.g., New York, 10001)"
                  disabled={isLoading}
                />
                
                <button
                  onClick={handleManualLocation}
                  disabled={isLoading || !username.trim() || !manualLocation.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                  <span>{isLoading ? 'Validating...' : 'Login with Manual Location'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Show Manual Input Button */}
          {!showManualInput && !locationError && (
            <button
              onClick={() => setShowManualInput(true)}
              className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 transition duration-200"
            >
              Enter location manually instead
            </button>
          )}
        </div>

        {/* API Key Notice */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-xs">
            <strong>Note:</strong> This demo uses mock weather data. To get real weather data, 
            add your free API key from <a href="https://www.weatherapi.com/" target="_blank" rel="noopener noreferrer" className="underline">WeatherAPI.com</a> 
            in the weatherApi.ts file.
          </p>
        </div>
      </div>
    </div>
  );
}