import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { MapPin, Thermometer, Droplets, Wind, Eye, Gauge, Sun, AlertTriangle, RefreshCw } from 'lucide-react';
import { LocationService, type LocationData, type WeatherResponse } from '../utils/locationService';

const WeatherWidget: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    // Get location from localStorage (saved during login)
    const savedLocation = LocationService.getSavedLocation();
    if (savedLocation) {
      setLocation(savedLocation);
      loadWeatherData(savedLocation);
    }
  }, []);

  const loadWeatherData = async (locationData: LocationData) => {
    setLoading(true);
    setError(null);
    try {
      const weather = await LocationService.getWeatherData(locationData);
      setWeatherData(weather);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const locationData = await LocationService.getCurrentLocation();
      setLocation(locationData);
      await loadWeatherData(locationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
      setShowManualInput(true);
    } finally {
      setLoading(false);
    }
  };

  const handleManualLocation = async () => {
    if (!manualLocation.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const locationData = await LocationService.getLocationByQuery(manualLocation);
      setLocation(locationData);
      await loadWeatherData(locationData);
      setShowManualInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!weatherData && !loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Get Weather Data for Your Farm</h3>
          <p className="text-gray-600 mb-6">मौसम की जानकारी प्राप्त करें</p>
          <div className="space-y-4">
            <Button onClick={handleAutoLocation} className="w-full max-w-md bg-orange-600 hover:bg-orange-700">
              <MapPin className="h-4 w-4 mr-2" />
              Auto-Detect My Location | स्वचालित स्थान
            </Button>
            
            {showManualInput && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Or enter your location manually:</p>
                <div className="flex gap-2 max-w-md mx-auto">
                  <Input
                    placeholder="Enter city name or pincode"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
                  />
                  <Button onClick={handleManualLocation} className="bg-orange-600 hover:bg-orange-700">Search</Button>
                </div>
              </div>
            )}
            
            {!showManualInput && (
              <Button variant="outline" onClick={() => setShowManualInput(true)}>
                Enter location manually instead
              </Button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        <span className="ml-3 text-lg">Loading weather data...</span>
      </div>
    );
  }

  if (!weatherData) return null;

  return (
    <div className="space-y-6">
      {/* Location Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
          <MapPin className="h-5 w-5 text-orange-600" />
          {weatherData.location.name}, {weatherData.location.country}
        </h3>
        <p className="text-gray-600">
          {new Date(weatherData.location.localtime).toLocaleString()}
        </p>
        <div className="flex justify-center gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowManualInput(true)}
          >
            Change Location
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => location && loadWeatherData(location)}
            disabled={loading}
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Manual Location Input */}
      {showManualInput && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter city name or pincode"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
              />
              <Button onClick={handleManualLocation} className="bg-orange-600 hover:bg-orange-700">Search</Button>
              <Button variant="outline" onClick={() => setShowManualInput(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Weather */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-600">
            <Thermometer className="h-5 w-5" />
            Current Weather | वर्तमान मौसम
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {Math.round(weatherData.current.temp_c)}°C
              </div>
              <div className="text-sm text-gray-600">
                Feels like {Math.round(weatherData.current.feelslike_c)}°C
              </div>
              <div className="text-sm font-medium">
                {weatherData.current.condition.text}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <div>
                <div className="font-semibold">{weatherData.current.humidity}%</div>
                <div className="text-sm text-gray-600">Humidity</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-gray-500" />
              <div>
                <div className="font-semibold">{weatherData.current.wind_kph} km/h</div>
                <div className="text-sm text-gray-600">Wind Speed</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="font-semibold">UV {weatherData.current.uv}</div>
                <div className="text-sm text-gray-600">UV Index</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-purple-500" />
              <div>
                <div className="font-semibold">{weatherData.current.pressure_mb} mb</div>
                <div className="text-sm text-gray-600">Pressure</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-500" />
              <div>
                <div className="font-semibold">{weatherData.current.vis_km} km</div>
                <div className="text-sm text-gray-600">Visibility</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weather Alerts */}
      {weatherData.alerts && weatherData.alerts.alert.length > 0 && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              Weather Alerts | मौसम चेतावनी
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weatherData.alerts.alert.map((alert, index) => (
                <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800">{alert.headline}</h4>
                  <p className="text-sm text-orange-700 mt-1">{alert.desc}</p>
                  <div className="flex gap-4 mt-2 text-xs text-orange-600">
                    <span>Severity: {alert.severity}</span>
                    <span>Urgency: {alert.urgency}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 7-Day Forecast */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-orange-600">7-Day Forecast | 7 दिन का पूर्वानुमान</CardTitle>
          <p className="text-sm text-gray-600">Weather outlook for your farming operations</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
            {weatherData.forecast.forecastday.map((day, index) => (
              <div key={day.date} className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="font-semibold text-sm">
                  {index === 0 ? 'Today' : formatDate(day.date)}
                </div>
                <img 
                  src={`https:${day.day.condition.icon}`} 
                  alt={day.day.condition.text}
                  className="w-12 h-12 mx-auto my-2"
                />
                <div className="text-xs text-gray-600 mb-1">
                  {day.day.condition.text}
                </div>
                <div className="text-sm font-semibold">
                  {Math.round(day.day.maxtemp_c)}° / {Math.round(day.day.mintemp_c)}°
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {day.day.daily_chance_of_rain}% rain
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agricultural Insights */}
      <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-orange-600">Agricultural Weather Insights | कृषि मौसम सुझाव</CardTitle>
          <p className="text-sm text-gray-600">Weather-based farming recommendations</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">🚿 Irrigation Advice | सिंचाई सलाह</h4>
              <p className="text-sm text-green-700">
                {weatherData.current.humidity > 70 
                  ? "High humidity detected. Consider reducing irrigation frequency. | उच्च आर्द्रता - सिंचाई कम करें।"
                  : weatherData.forecast.forecastday[0].day.daily_chance_of_rain > 60
                  ? "Rain expected today. Delay irrigation if possible. | आज बारिश की संभावना - सिंचाई स्थगित करें।"
                  : "Good conditions for irrigation. Monitor soil moisture levels. | सिंचाई के लिए अच्छी स्थिति।"
                }
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">🚜 Field Work Conditions | खेत कार्य स्थिति</h4>
              <p className="text-sm text-blue-700">
                {weatherData.current.wind_kph > 20
                  ? "High winds detected. Avoid spraying operations. | तेज हवा - छिड़काव न करें।"
                  : weatherData.current.vis_km < 5
                  ? "Low visibility. Exercise caution during field operations. | कम दृश्यता - सावधानी बरतें।"
                  : "Good conditions for field work and machinery operations. | खेत कार्य के लिए अच्छी स्थिति।"
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;