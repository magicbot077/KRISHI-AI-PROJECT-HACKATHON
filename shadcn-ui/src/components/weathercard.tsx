import React from 'react';
import { Thermometer, Droplets, Wind, Eye, Gauge, Sun } from 'lucide-react';
import { CurrentWeather } from '../utils/weatherApi';

interface WeatherCardProps {
  current: CurrentWeather;
  locationName: string;
  localTime: string;
}

export default function WeatherCard({ current, locationName, localTime }: WeatherCardProps) {
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUVLevel = (uv: number) => {
    if (uv <= 2) return { level: 'Low', color: 'text-green-600' };
    if (uv <= 5) return { level: 'Moderate', color: 'text-yellow-600' };
    if (uv <= 7) return { level: 'High', color: 'text-orange-600' };
    if (uv <= 10) return { level: 'Very High', color: 'text-red-600' };
    return { level: 'Extreme', color: 'text-purple-600' };
  };

  const uvInfo = getUVLevel(current.uv);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{locationName}</h2>
          <p className="text-gray-600">{formatTime(localTime)}</p>
        </div>
        <img
          src={`https:${current.condition.icon}`}
          alt={current.condition.text}
          className="w-16 h-16"
        />
      </div>

      {/* Main Temperature */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-baseline">
            <span className="text-5xl font-bold text-gray-900">{Math.round(current.temp_c)}</span>
            <span className="text-2xl text-gray-600 ml-1">°C</span>
          </div>
          <p className="text-gray-600 mt-1">
            Feels like {Math.round(current.feelslike_c)}°C
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-semibold text-gray-900">{current.condition.text}</p>
          <p className="text-gray-600">
            {Math.round(current.temp_f)}°F (feels like {Math.round(current.feelslike_f)}°F)
          </p>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Droplets className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Humidity</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{current.humidity}%</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Wind className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Wind Speed</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{current.wind_kph} km/h</p>
          <p className="text-sm text-gray-600">{current.wind_mph} mph</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Gauge className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Pressure</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{current.pressure_mb}</p>
          <p className="text-sm text-gray-600">mb</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Sun className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">UV Index</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{current.uv}</p>
          <p className={`text-sm font-medium ${uvInfo.color}`}>{uvInfo.level}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Eye className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Visibility</span>
          </div>
          <p className="text-2xl font-bold text-gray-600">{current.vis_km}</p>
          <p className="text-sm text-gray-600">km</p>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Thermometer className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-700">Temperature</span>
          </div>
          <p className="text-lg font-bold text-red-600">{Math.round(current.temp_c)}°C</p>
          <p className="text-sm text-gray-600">{Math.round(current.temp_f)}°F</p>
        </div>
      </div>
    </div>
  );
}