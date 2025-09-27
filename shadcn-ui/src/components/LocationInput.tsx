import React, { useState } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { fetchWeatherByCity } from '../utils/weatherApi';
import { saveLocationToStorage } from '../utils/geolocation';

interface LocationInputProps {
  onLocationChange: () => void;
  currentLocation: string;
}

export default function LocationInput({ onLocationChange, currentLocation }: LocationInputProps) {
  const [newLocation, setNewLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLocationChange = async () => {
    if (!newLocation.trim()) {
      setError('Please enter a city name or pincode');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Validate location by fetching weather data
      const weatherData = await fetchWeatherByCity(newLocation);
      
      const location = {
        latitude: weatherData.location.lat,
        longitude: weatherData.location.lon,
        city: weatherData.location.name,
        country: weatherData.location.country,
      };

      saveLocationToStorage(location);
      setNewLocation('');
      onLocationChange();
    } catch (error) {
      setError('Invalid location. Please try a different city name or pincode.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLocationChange();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <MapPin className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Change Location</h3>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Current location:</p>
        <p className="font-semibold text-gray-900">{currentLocation}</p>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter city name or pincode (e.g., New York, 10001)"
            disabled={isLoading}
          />
          <button
            onClick={handleLocationChange}
            disabled={isLoading || !newLocation.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">{isLoading ? 'Searching...' : 'Search'}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>
            <strong>Tip:</strong> You can search by city name (e.g., "New York", "London") or 
            postal code (e.g., "10001", "SW1A 1AA").
          </p>
        </div>
      </div>
    </div>
  );
}