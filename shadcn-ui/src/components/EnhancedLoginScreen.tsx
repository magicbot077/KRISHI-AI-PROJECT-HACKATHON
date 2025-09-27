import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Leaf, 
  MapPin, 
  User,
  Navigation,
  CheckCircle,
  Loader2,
  Sparkles,
  CloudSun,
  TrendingUp,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { LocationService, type LocationData } from '@/utils/locationService';

interface EnhancedLoginScreenProps {
  onLogin: (userData: { name: string; location: LocationData }) => void;
}

export default function EnhancedLoginScreen({ onLogin }: EnhancedLoginScreenProps) {
  const [name, setName] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    // Check for saved location on mount
    const savedLocation = LocationService.getSavedLocation();
    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, []);

  const handleAutoDetectLocation = async () => {
    setIsDetectingLocation(true);
    setError('');
    
    try {
      const locationData = await LocationService.getCurrentLocation();
      setLocation(locationData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect location');
      setShowManualInput(true);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleManualLocation = async () => {
    if (!manualLocation.trim()) {
      setError('Please enter a city name or pincode');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const locationData = await LocationService.getLocationByQuery(manualLocation);
      setLocation(locationData);
      setShowManualInput(false);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!location) {
      setError('Please set your location first');
      return;
    }

    setIsLoading(true);
    
    try {
      // Pre-fetch weather data for better UX
      await LocationService.getWeatherData(location);
      
      const userData = { 
        name: name.trim(), 
        location 
      };
      
      // Save to localStorage
      localStorage.setItem('krishiAI_user', JSON.stringify(userData));
      onLogin(userData);
    } catch (err) {
      console.warn('Failed to pre-fetch weather:', err);
      // Continue with login even if weather fetch fails
      const userData = { 
        name: name.trim(), 
        location 
      };
      localStorage.setItem('krishiAI_user', JSON.stringify(userData));
      onLogin(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = name.trim() && location;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-emerald-400/10 to-green-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300">
                <Leaf className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-full animate-bounce">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Welcome to KrishiAI
            </h1>
            <p className="text-xl text-gray-700 font-medium">
              कृषि AI में आपका स्वागत है
            </p>
            <p className="text-gray-600">
              Your Intelligent Farming Companion
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Get Started | शुरू करें
            </CardTitle>
            <p className="text-gray-600">
              Enter your details for personalized farming insights
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-3">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="h-4 w-4 text-green-600" />
                  Your Name | आपका नाम
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name / अपना नाम दर्ज करें"
                  className="h-12 text-base border-2 border-gray-200 focus:border-green-500 transition-colors"
                  required
                />
              </div>

              {/* Location Section */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Farm Location | खेत का स्थान
                </Label>
                
                {location ? (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-green-800">
                          📍 {location.city || 'Your Location'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLocation(null);
                          setShowManualInput(true);
                        }}
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      type="button"
                      onClick={handleAutoDetectLocation}
                      disabled={isDetectingLocation}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                    >
                      {isDetectingLocation ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Detecting Location...
                        </>
                      ) : (
                        <>
                          <Navigation className="h-5 w-5 mr-2" />
                          Auto-Detect My Location | स्वचालित स्थान
                        </>
                      )}
                    </Button>
                    
                    {!showManualInput && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowManualInput(true)}
                        className="w-full border-2 border-gray-300 hover:border-green-500 hover:bg-green-50"
                      >
                        Enter Location Manually | मैन्युअल रूप से दर्ज करें
                      </Button>
                    )}
                  </div>
                )}

                {/* Manual Location Input */}
                {showManualInput && !location && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                    <Input
                      type="text"
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      placeholder="Enter city, village, or pincode / शहर, गांव या पिनकोड"
                      className="h-12 text-base"
                      onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        onClick={handleManualLocation}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Find Location'
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowManualInput(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 shadow-xl transform hover:scale-[1.02] transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Setting up your dashboard...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Continue to Dashboard | डैशबोर्ड पर जाएं
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <Card className="backdrop-blur-xl bg-gradient-to-br from-white/70 to-green-50/70 border-0 shadow-xl">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-center mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              What awaits you | आपका इंतजार क्या कर रहा है
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Leaf className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Smart Crops</p>
                  <p className="text-xs text-gray-600">AI Recommendations</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <CloudSun className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Weather</p>
                  <p className="text-xs text-gray-600">7-Day Forecast</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Market</p>
                  <p className="text-xs text-gray-600">Live Prices</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-xl">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm">AI Assistant</p>
                  <p className="text-xs text-gray-600">24/7 Support</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 font-medium">
            🚀 Powered by Advanced AI • Made for Indian Farmers
          </p>
          <p className="text-sm text-gray-500">
            उन्नत AI द्वारा संचालित • भारतीय किसानों के लिए बनाया गया
          </p>
        </div>
      </div>
    </div>
  );
}