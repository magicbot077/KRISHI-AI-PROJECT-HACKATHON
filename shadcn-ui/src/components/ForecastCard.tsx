import React from 'react';
import { Calendar, CloudRain, CloudSnow } from 'lucide-react';
import { ForecastDay } from '@/utils/weatherApi';

interface ForecastCardProps {
  forecast: ForecastDay[];
}

export default function ForecastCard({ forecast }: ForecastCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const getRainChanceColor = (chance: number) => {
    if (chance >= 70) return 'text-blue-600 bg-blue-100';
    if (chance >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Calendar className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">7-Day Forecast</h3>
      </div>

      <div className="space-y-4">
        {forecast.map((day, index) => (
          <div
            key={day.date}
            className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
              index === 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {/* Date and Condition */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${index === 0 ? 'text-blue-900' : 'text-gray-900'}`}>
                  {formatDate(day.date)}
                </p>
                <p className="text-sm text-gray-600 truncate">{day.day.condition.text}</p>
              </div>
              <img
                src={`https:${day.day.condition.icon}`}
                alt={day.day.condition.text}
                className="w-10 h-10 flex-shrink-0"
              />
            </div>

            {/* Temperature Range */}
            <div className="text-right mx-4">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-gray-900">
                  {Math.round(day.day.maxtemp_c)}°
                </span>
                <span className="text-gray-500">
                  {Math.round(day.day.mintemp_c)}°
                </span>
              </div>
            </div>

            {/* Rain/Snow Chance */}
            <div className="flex items-center space-x-2">
              {day.day.daily_chance_of_rain > 0 && (
                <div className="flex items-center space-x-1">
                  <CloudRain className="h-4 w-4 text-blue-500" />
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getRainChanceColor(
                      day.day.daily_chance_of_rain
                    )}`}
                  >
                    {day.day.daily_chance_of_rain}%
                  </span>
                </div>
              )}
              {day.day.daily_chance_of_snow > 0 && (
                <div className="flex items-center space-x-1">
                  <CloudSnow className="h-4 w-4 text-blue-300" />
                  <span className="text-xs px-2 py-1 rounded-full text-blue-600 bg-blue-100">
                    {day.day.daily_chance_of_snow}%
                  </span>
                </div>
              )}
              {day.day.daily_chance_of_rain === 0 && day.day.daily_chance_of_snow === 0 && (
                <span className="text-xs px-2 py-1 rounded-full text-green-600 bg-green-100">
                  Clear
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Forecast Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Week Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Average High</p>
            <p className="font-bold text-gray-900">
              {Math.round(
                forecast.reduce((sum, day) => sum + day.day.maxtemp_c, 0) / forecast.length
              )}°C
            </p>
          </div>
          <div>
            <p className="text-gray-600">Average Low</p>
            <p className="font-bold text-gray-900">
              {Math.round(
                forecast.reduce((sum, day) => sum + day.day.mintemp_c, 0) / forecast.length
              )}°C
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}