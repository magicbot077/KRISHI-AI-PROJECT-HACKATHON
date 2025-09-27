export interface WeatherCondition {
  text: string;
  icon: string;
  code: number;
}

export interface CurrentWeather {
  temp_c: number;
  temp_f: number;
  feelslike_c: number;
  feelslike_f: number;
  condition: WeatherCondition;
  humidity: number;
  wind_kph: number;
  wind_mph: number;
  pressure_mb: number;
  uv: number;
  vis_km: number;
}

export interface ForecastDay {
  date: string;
  day: {
    maxtemp_c: number;
    mintemp_c: number;
    condition: WeatherCondition;
    daily_chance_of_rain: number;
    daily_chance_of_snow: number;
  };
}

export interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: CurrentWeather;
  forecast: {
    forecastday: ForecastDay[];
  };
  alerts?: {
    alert: Array<{
      headline: string;
      desc: string;
      severity: string;
      urgency: string;
      areas: string;
    }>;
  };
}

// Configuration for API key - users need to set their own
export const WEATHER_API_CONFIG = {
  baseUrl: 'https://api.weatherapi.com/v1',
  // Users should replace this with their own free API key from weatherapi.com
  apiKey: 'YOUR_API_KEY_HERE', // Get free key from https://www.weatherapi.com/
};

export const fetchWeatherData = async (
  latitude: number,
  longitude: number,
  apiKey?: string
): Promise<WeatherData> => {
  const key = apiKey || WEATHER_API_CONFIG.apiKey;
  
  if (key === 'YOUR_API_KEY_HERE') {
    // Return mock data for demo purposes
    return getMockWeatherData(latitude, longitude);
  }

  const url = `${WEATHER_API_CONFIG.baseUrl}/forecast.json?key=${key}&q=${latitude},${longitude}&days=7&aqi=no&alerts=yes`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Fallback to mock data
    return getMockWeatherData(latitude, longitude);
  }
};

export const fetchWeatherByCity = async (
  city: string,
  apiKey?: string
): Promise<WeatherData> => {
  const key = apiKey || WEATHER_API_CONFIG.apiKey;
  
  if (key === 'YOUR_API_KEY_HERE') {
    // Return mock data for demo purposes
    return getMockWeatherDataByCity(city);
  }

  const url = `${WEATHER_API_CONFIG.baseUrl}/forecast.json?key=${key}&q=${encodeURIComponent(city)}&days=7&aqi=no&alerts=yes`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Fallback to mock data
    return getMockWeatherDataByCity(city);
  }
};

// Mock data for demo purposes when no API key is provided
const getMockWeatherData = (lat: number, lon: number): WeatherData => {
  return {
    location: {
      name: 'Demo City',
      region: 'Demo Region',
      country: 'Demo Country',
      lat,
      lon,
      localtime: new Date().toISOString(),
    },
    current: {
      temp_c: 22,
      temp_f: 72,
      feelslike_c: 25,
      feelslike_f: 77,
      condition: {
        text: 'Partly cloudy',
        icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
        code: 1003,
      },
      humidity: 65,
      wind_kph: 15,
      wind_mph: 9,
      pressure_mb: 1013,
      uv: 5,
      vis_km: 10,
    },
    forecast: {
      forecastday: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        day: {
          maxtemp_c: 22 + Math.random() * 10,
          mintemp_c: 15 + Math.random() * 5,
          condition: {
            text: ['Sunny', 'Partly cloudy', 'Cloudy', 'Light rain'][Math.floor(Math.random() * 4)],
            icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
            code: 1003,
          },
          daily_chance_of_rain: Math.floor(Math.random() * 100),
          daily_chance_of_snow: 0,
        },
      })),
    },
    alerts: {
      alert: [
        {
          headline: 'Demo Weather Alert',
          desc: 'This is demo data. Please add your own WeatherAPI.com key for real data.',
          severity: 'Minor',
          urgency: 'Future',
          areas: 'Demo Area',
        },
      ],
    },
  };
};

const getMockWeatherDataByCity = (city: string): WeatherData => {
  const mockData = getMockWeatherData(0, 0);
  mockData.location.name = city;
  return mockData;
};