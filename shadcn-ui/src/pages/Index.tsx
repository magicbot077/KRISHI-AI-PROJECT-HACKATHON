import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Leaf, 
  CloudRain, 
  TrendingUp, 
  MapPin, 
  Smartphone,
  Users,
  BarChart3,
  Settings,
  LogOut,
  MessageCircle,
  Sparkles,
  Sun,
  Droplets,
  Wind,
  Thermometer,
  RefreshCw,
  Loader2
} from 'lucide-react';
import CropRecommendation from '@/components/CropRecommendation';
import SoilAnalysis from '@/components/SoilAnalysis';
import WeatherWidget from '@/components/WeatherWidget';
import MarketDashboard from '@/components/MarketDashboard';
import YieldCalculator from '@/components/YieldCalculator';
import SustainabilityScore from '@/components/SustainabilityScore';
import AIChatbot from '@/components/AIChatbot';
import EnhancedLoginScreen from '@/components/EnhancedLoginScreen';
import { LocationService, type LocationData, type WeatherResponse } from '@/utils/locationService';

interface UserData {
  name: string;
  location: LocationData;
}

export default function FarmDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('krishiAI_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        loadWeatherData(userData.location);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('krishiAI_user');
      }
    }
    setIsLoading(false);
  }, []);

  const loadWeatherData = async (location: LocationData) => {
    setWeatherLoading(true);
    try {
      const weather = await LocationService.getWeatherData(location);
      setWeatherData(weather);
    } catch (error) {
      console.error('Failed to load weather data:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleLogin = (userData: UserData) => {
    setUser(userData);
    loadWeatherData(userData.location);
  };

  const handleLogout = () => {
    localStorage.removeItem('krishiAI_user');
    LocationService.clearCache();
    setUser(null);
    setWeatherData(null);
    setActiveTab('dashboard');
  };

  const refreshWeather = async () => {
    if (user?.location) {
      await loadWeatherData(user.location);
    }
  };

  const getQuickStats = () => {
    const currentTemp = weatherData?.current.temp_c || 24;
    const currentCondition = weatherData?.current.condition.text || 'Pleasant';
    
    return [
      {
        title: 'Farm Area',
        titleHindi: 'खेत का क्षेत्र',
        value: '5.2 Acres',
        icon: <MapPin className="h-4 w-4" />,
        color: 'bg-gradient-to-br from-green-500 to-emerald-600'
      },
      {
        title: 'Current Season',
        titleHindi: 'वर्तमान मौसम',
        value: 'Rabi',
        icon: <Leaf className="h-4 w-4" />,
        color: 'bg-gradient-to-br from-blue-500 to-cyan-600'
      },
      {
        title: 'Weather',
        titleHindi: 'मौसम',
        value: `${currentTemp}°C`,
        icon: <CloudRain className="h-4 w-4" />,
        color: 'bg-gradient-to-br from-orange-500 to-red-500'
      },
      {
        title: 'Profit This Season',
        titleHindi: 'इस मौसम का लाभ',
        value: '₹45,000',
        icon: <TrendingUp className="h-4 w-4" />,
        color: 'bg-gradient-to-br from-purple-500 to-pink-600'
      }
    ];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-3xl shadow-2xl animate-pulse">
              <Leaf className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-full animate-bounce">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading KrishiAI...</p>
          <p className="text-gray-600">कृषि AI लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <EnhancedLoginScreen onLogin={handleLogin} />;
  }

  const quickStats = getQuickStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-green-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-xl shadow-xl border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl shadow-lg">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 p-1 rounded-full">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  KrishiAI - कृषि AI
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  Smart Farming Assistant | स्मार्ट कृषि सहायक
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Weather Quick Info */}
              {weatherData && (
                <div className="hidden md:flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-green-50 px-4 py-2 rounded-xl border border-blue-200">
                  <Thermometer className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-semibold text-gray-700">
                    {Math.round(weatherData.current.temp_c)}°C
                  </span>
                  <span className="text-xs text-gray-600">
                    {weatherData.location.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshWeather}
                    disabled={weatherLoading}
                    className="h-6 w-6 p-0"
                  >
                    <RefreshCw className={`h-3 w-3 ${weatherLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              )}
              
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">
                  📍 {user.location.city || 'Your Farm'}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="hover:bg-blue-50 border-blue-200">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="hover:bg-red-50 border-red-200 text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7 bg-white/80 backdrop-blur-xl shadow-lg border-0 p-1">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chat"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </TabsTrigger>
            <TabsTrigger 
              value="recommendations"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-lime-600 data-[state=active]:text-white"
            >
              <Leaf className="h-4 w-4" />
              <span className="hidden sm:inline">Crops</span>
            </TabsTrigger>
            <TabsTrigger 
              value="soil"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white"
            >
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Soil</span>
            </TabsTrigger>
            <TabsTrigger 
              value="weather"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              <CloudRain className="h-4 w-4" />
              <span className="hidden sm:inline">Weather</span>
            </TabsTrigger>
            <TabsTrigger 
              value="market"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Market</span>
            </TabsTrigger>
            <TabsTrigger 
              value="sustainability"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Green</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Enhanced Welcome Section */}
            <Card className="bg-gradient-to-br from-green-500 via-emerald-600 to-blue-600 text-white shadow-2xl border-0 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <CardContent className="p-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold">
                      Welcome back, {user.name}! 🌟
                    </h2>
                    <p className="text-green-100 text-lg font-medium">
                      आपके खेत के लिए आज की सिफारिशें तैयार हैं
                    </p>
                    {weatherData && (
                      <div className="flex items-center space-x-4 text-white/90">
                        <div className="flex items-center space-x-2">
                          <Thermometer className="h-5 w-5" />
                          <span>{Math.round(weatherData.current.temp_c)}°C</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Droplets className="h-5 w-5" />
                          <span>{weatherData.current.humidity}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Wind className="h-5 w-5" />
                          <span>{weatherData.current.wind_kph} km/h</span>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button 
                        variant="secondary" 
                        onClick={() => setActiveTab('recommendations')}
                        className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border-white/30"
                      >
                        <Smartphone className="h-4 w-4 mr-2" />
                        Get AI Recommendations
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('chat')}
                        className="border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Ask AI Assistant
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('weather')}
                        className="border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                      >
                        <CloudRain className="h-4 w-4 mr-2" />
                        View Weather
                      </Button>
                    </div>
                  </div>
                  <div className="text-8xl opacity-20 hidden lg:block">
                    🌾
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">{stat.titleHindi}</p>
                        <p className="text-sm font-semibold text-gray-900">{stat.title}</p>
                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Enhanced Quick Actions */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card 
                className="bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group" 
                onClick={() => setActiveTab('chat')}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-purple-600 group-hover:text-purple-700">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-xl">
                      <MessageCircle className="h-5 w-5 text-white" />
                    </div>
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    AI सहायक - Ask questions about farming, weather, crops in Hindi or English
                  </p>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    Voice & Text Support
                  </Badge>
                </CardContent>
              </Card>

              <Card 
                className="bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group" 
                onClick={() => setActiveTab('recommendations')}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-green-600 group-hover:text-green-700">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl">
                      <Leaf className="h-5 w-5 text-white" />
                    </div>
                    Smart Crops
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    फसल की सिफारिशें - AI-powered crop suggestions based on your soil and weather
                  </p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    5 crops recommended
                  </Badge>
                </CardContent>
              </Card>

              <Card 
                className="bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => setActiveTab('market')}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-blue-600 group-hover:text-blue-700">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    Market Prices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    बाजार की कीमतें - Latest mandi rates and demand trends
                  </p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Updated today
                  </Badge>
                </CardContent>
              </Card>

              <Card 
                className="bg-white/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                onClick={() => setActiveTab('weather')}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-orange-600 group-hover:text-orange-700">
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2 rounded-xl">
                      <CloudRain className="h-5 w-5 text-white" />
                    </div>
                    Weather Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    मौसम पूर्वानुमान - 7-day weather forecast for your farm
                  </p>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {weatherData ? `${Math.round(weatherData.current.temp_c)}°C` : 'Loading...'}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Weather Summary on Dashboard */}
            {weatherData && (
              <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <CloudRain className="h-5 w-5" />
                    Today's Weather | आज का मौसम
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                      <Thermometer className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-orange-600">
                        {Math.round(weatherData.current.temp_c)}°C
                      </p>
                      <p className="text-xs text-gray-600">Temperature</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                      <Droplets className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-600">
                        {weatherData.current.humidity}%
                      </p>
                      <p className="text-xs text-gray-600">Humidity</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                      <Wind className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-600">
                        {weatherData.current.wind_kph}
                      </p>
                      <p className="text-xs text-gray-600">km/h Wind</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl">
                      <Sun className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-yellow-600">
                        {weatherData.current.uv}
                      </p>
                      <p className="text-xs text-gray-600">UV Index</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="chat">
            <AIChatbot />
          </TabsContent>

          <TabsContent value="recommendations">
            <CropRecommendation />
          </TabsContent>

          <TabsContent value="soil">
            <SoilAnalysis />
          </TabsContent>

          <TabsContent value="weather">
            <WeatherWidget />
          </TabsContent>

          <TabsContent value="market">
            <MarketDashboard />
          </TabsContent>

          <TabsContent value="sustainability">
            <div className="space-y-6">
              <SustainabilityScore />
              <YieldCalculator />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
