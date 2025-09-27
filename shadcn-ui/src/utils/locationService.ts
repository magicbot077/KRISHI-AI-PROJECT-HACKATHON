export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  timestamp: number;
}

export interface WeatherResponse {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    feelslike_c: number;
    uv: number;
    pressure_mb: number;
    vis_km: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        daily_chance_of_rain: number;
        daily_chance_of_snow: number;
      };
    }>;
  };
  alerts?: {
    alert: Array<{
      headline: string;
      desc: string;
      severity: string;
      urgency: string;
    }>;
  };
}

const WEATHER_API_KEY = 'acec82537d3d43ffa4c90619252309';
const WEATHER_API_BASE = 'https://api.weatherapi.com/v1';

export class LocationService {
  private static readonly LOCATION_KEY = 'krishiAI_user_location';
  private static readonly WEATHER_KEY = 'krishiAI_weather_cache';
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  static async getCurrentLocation(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now()
          };

          // Try to get city name from reverse geocoding
          try {
            const response = await fetch(
              `${WEATHER_API_BASE}/current.json?key=${WEATHER_API_KEY}&q=${locationData.latitude},${locationData.longitude}&aqi=no`
            );
            if (response.ok) {
              const data = await response.json();
              locationData.city = data.location.name;
              locationData.country = data.location.country;
            }
          } catch (error) {
            console.warn('Failed to get location name:', error);
          }

          this.saveLocation(locationData);
          resolve(locationData);
        },
        (error) => {
          let errorMessage = 'Unable to retrieve location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  static async getLocationByQuery(query: string): Promise<LocationData> {
    try {
      const response = await fetch(
        `${WEATHER_API_BASE}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}&aqi=no`
      );

      if (!response.ok) {
        throw new Error('Location not found');
      }

      const data = await response.json();
      const locationData: LocationData = {
        latitude: data.location.lat,
        longitude: data.location.lon,
        city: data.location.name,
        country: data.location.country,
        timestamp: Date.now()
      };

      this.saveLocation(locationData);
      return locationData;
    } catch (error) {
      throw new Error('Failed to find location. Please check the spelling and try again.');
    }
  }

  static saveLocation(location: LocationData): void {
    localStorage.setItem(this.LOCATION_KEY, JSON.stringify(location));
  }

  static getSavedLocation(): LocationData | null {
    try {
      const saved = localStorage.getItem(this.LOCATION_KEY);
      if (!saved) return null;

      const location = JSON.parse(saved) as LocationData;
      // Check if location is not too old (7 days)
      if (Date.now() - location.timestamp > 7 * 24 * 60 * 60 * 1000) {
        return null;
      }
      return location;
    } catch {
      return null;
    }
  }

  static async getWeatherData(location: LocationData): Promise<WeatherResponse> {
    try {
      // Check cache first
      const cached = this.getCachedWeather();
      if (cached && this.isCacheValid(cached.timestamp)) {
        return cached.data;
      }

      const response = await fetch(
        `${WEATHER_API_BASE}/forecast.json?key=${WEATHER_API_KEY}&q=${location.latitude},${location.longitude}&days=7&aqi=no&alerts=yes`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const weatherData = await response.json();
      
      // Cache the response
      this.cacheWeather(weatherData);
      
      return weatherData;
    } catch (error) {
      console.error('Weather API error:', error);
      
      // Return cached data if available, even if expired
      const cached = this.getCachedWeather();
      if (cached) {
        return cached.data;
      }
      
      // Return mock data as last resort
      return this.getMockWeatherData(location);
    }
  }

  private static cacheWeather(data: WeatherResponse): void {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(this.WEATHER_KEY, JSON.stringify(cacheData));
  }

  private static getCachedWeather(): { data: WeatherResponse; timestamp: number } | null {
    try {
      const cached = localStorage.getItem(this.WEATHER_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  private static isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private static getMockWeatherData(location: LocationData): WeatherResponse {
    return {
      location: {
        name: location.city || 'Your Location',
        region: 'Demo Region',
        country: location.country || 'India',
        lat: location.latitude,
        lon: location.longitude,
        localtime: new Date().toISOString()
      },
      current: {
        temp_c: 28,
        temp_f: 82,
        condition: {
          text: 'Partly Cloudy',
          icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
        },
        humidity: 65,
        wind_kph: 12,
        feelslike_c: 31,
        uv: 6,
        pressure_mb: 1013,
        vis_km: 10
      },
      forecast: {
        forecastday: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          day: {
            maxtemp_c: 28 + Math.random() * 8,
            mintemp_c: 18 + Math.random() * 5,
            condition: {
              text: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)],
              icon: '//cdn.weatherapi.com/weather/64x64/day/116.png'
            },
            daily_chance_of_rain: Math.floor(Math.random() * 100),
            daily_chance_of_snow: 0
          }
        }))
      },
      alerts: {
        alert: []
      }
    };
  }

  static clearCache(): void {
    localStorage.removeItem(this.LOCATION_KEY);
    localStorage.removeItem(this.WEATHER_KEY);
  }
}