import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Leaf, 
  MapPin, 
  User,
  Navigation,
  CheckCircle
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (userData: { name: string; location: string }) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const detectLocation = async () => {
    setIsDetectingLocation(true);
    
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          });
        });

        // Simulate reverse geocoding (in production, use a real geocoding API)
        const { latitude, longitude } = position.coords;
        const mockLocation = `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E (Punjab, India)`;
        setLocation(mockLocation);
      } catch (error) {
        console.error('Error detecting location:', error);
        setLocation('Location detection failed - Please enter manually');
      }
    } else {
      setLocation('Geolocation not supported - Please enter manually');
    }
    
    setIsDetectingLocation(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && location.trim()) {
      const userData = { name: name.trim(), location: location.trim() };
      // Save to localStorage
      localStorage.setItem('krishiAI_user', JSON.stringify(userData));
      onLogin(userData);
    }
  };

  const isFormValid = name.trim() && location.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-green-600 p-4 rounded-full">
              <Leaf className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome to KrishiAI
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              कृषि AI में आपका स्वागत है
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Smart Farming Assistant for Better Crops
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-800">
              Get Started | शुरू करें
            </CardTitle>
            <p className="text-sm text-gray-600">
              Enter your details to access personalized farming recommendations
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                  <User className="h-4 w-4 text-green-600" />
                  Your Name | आपका नाम
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name / अपना नाम दर्ज करें"
                  className="h-12 text-base"
                  required
                />
              </div>

              {/* Location Input */}
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Farm Location | खेत का स्थान
                </Label>
                <div className="space-y-2">
                  <Input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your location / अपना स्थान दर्ज करें"
                    className="h-12 text-base"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={detectLocation}
                    disabled={isDetectingLocation}
                    className="w-full h-10"
                  >
                    {isDetectingLocation ? (
                      <>
                        <Navigation className="h-4 w-4 mr-2 animate-spin" />
                        Detecting Location...
                      </>
                    ) : (
                      <>
                        <Navigation className="h-4 w-4 mr-2" />
                        Auto-Detect Location | स्वचालित स्थान
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid}
                className="w-full h-12 text-base bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Continue to Dashboard | डैशबोर्ड पर जाएं
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <Card className="bg-gradient-to-r from-green-100 to-blue-100 border-0">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-800 mb-3 text-center">
              What you'll get | आपको क्या मिलेगा
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600">🌾</span>
                <span>Crop Recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">🌤️</span>
                <span>Weather Forecast</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-600">📊</span>
                <span>Market Prices</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-600">💰</span>
                <span>Profit Calculator</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>Powered by AI • Made for Indian Farmers</p>
          <p>AI द्वारा संचालित • भारतीय किसानों के लिए बनाया गया</p>
        </div>
      </div>
    </div>
  );
}