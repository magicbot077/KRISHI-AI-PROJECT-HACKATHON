import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  TrendingUp, 
  Droplets, 
  Calendar,
  IndianRupee,
  Leaf,
  ThumbsUp,
  ThumbsDown,
  RefreshCw
} from 'lucide-react';
import { aiModel, CropRecommendation as CropRec, SoilData, WeatherData } from '@/lib/aiModel';

export default function CropRecommendation() {
  const [recommendations, setRecommendations] = useState<CropRec[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState<CropRec | null>(null);

  // Mock soil and weather data - in production, this would come from sensors/APIs
  const mockSoilData: SoilData = {
    pH: 6.8,
    moisture: 65,
    nitrogen: 280,
    phosphorus: 45,
    potassium: 180,
    organicMatter: 2.8
  };

  const mockWeatherData: WeatherData = {
    temperature: 26,
    humidity: 72,
    rainfall: 45,
    season: 'rabi'
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      const recs = aiModel.calculateSuitability(mockSoilData, mockWeatherData);
      setRecommendations(recs);
      setSelectedCrop(recs[0]);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateRecommendations();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getWaterIcon = (requirement: string) => {
    switch (requirement) {
      case 'low': return '💧';
      case 'medium': return '💧💧';
      case 'high': return '💧💧💧';
      default: return '💧';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            AI Crop Recommendations
          </h2>
          <p className="text-gray-600">
            फसल की सिफारिशें - Based on your soil, weather, and market conditions
          </p>
        </div>
        <Button 
          onClick={generateRecommendations} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Analyzing...' : 'Refresh AI Analysis'}
        </Button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="grid" className="space-y-6">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="detailed">Detailed View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 6).map((crop) => (
                <Card 
                  key={crop.id} 
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedCrop?.id === crop.id ? 'ring-2 ring-green-500' : ''
                  }`}
                  onClick={() => setSelectedCrop(crop)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{crop.image}</span>
                        <div>
                          <CardTitle className="text-lg">{crop.name}</CardTitle>
                          <p className="text-sm text-gray-600">{crop.nameHindi}</p>
                        </div>
                      </div>
                      <Badge className={`${getScoreColor(crop.suitabilityScore)} border-0`}>
                        {crop.suitabilityScore}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Suitability</span>
                        <span>{crop.suitabilityScore}%</span>
                      </div>
                      <Progress value={crop.suitabilityScore} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span>₹{crop.profitMargin}% profit</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Droplets className="h-3 w-3 text-blue-600" />
                        <span>{getWaterIcon(crop.waterRequirement)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-purple-600" />
                        <span>{crop.growthPeriod}m</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IndianRupee className="h-3 w-3 text-orange-600" />
                        <span>₹{crop.marketPrice}/ton</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            {selectedCrop && (
              <Card className="border-2 border-green-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-6xl">{selectedCrop.image}</span>
                      <div>
                        <CardTitle className="text-2xl">{selectedCrop.name}</CardTitle>
                        <p className="text-lg text-gray-600">{selectedCrop.nameHindi}</p>
                        <Badge className={`${getScoreColor(selectedCrop.suitabilityScore)} border-0 mt-2`}>
                          {selectedCrop.suitabilityScore}% Suitable
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <Card className="bg-green-50">
                      <CardContent className="p-4 text-center">
                        <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Expected Yield</p>
                        <p className="text-xl font-bold">{selectedCrop.expectedYield} tons/acre</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-blue-50">
                      <CardContent className="p-4 text-center">
                        <IndianRupee className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Profit Margin</p>
                        <p className="text-xl font-bold">{selectedCrop.profitMargin}%</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50">
                      <CardContent className="p-4 text-center">
                        <Leaf className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Sustainability</p>
                        <p className="text-xl font-bold">{selectedCrop.sustainabilityScore}/100</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-orange-50">
                      <CardContent className="p-4 text-center">
                        <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Growth Period</p>
                        <p className="text-xl font-bold">{selectedCrop.growthPeriod} months</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Pros and Cons */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="bg-green-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                          <ThumbsUp className="h-5 w-5" />
                          Advantages | लाभ
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedCrop.pros.map((pro, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-600 mt-1">✓</span>
                              <span className="text-sm">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                          <ThumbsDown className="h-5 w-5" />
                          Challenges | चुनौतियां
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedCrop.cons.map((con, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-red-600 mt-1">⚠</span>
                              <span className="text-sm">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      <Leaf className="h-4 w-4 mr-2" />
                      Select This Crop
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Plan Cultivation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Recommendations List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">All Recommendations</h3>
              {recommendations.map((crop, index) => (
                <Card 
                  key={crop.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedCrop?.id === crop.id ? 'bg-green-50 border-green-200' : ''
                  }`}
                  onClick={() => setSelectedCrop(crop)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                          <span className="text-2xl">{crop.image}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{crop.name} | {crop.nameHindi}</h4>
                          <p className="text-sm text-gray-600">
                            {crop.expectedYield} tons/acre • ₹{crop.marketPrice}/ton • {crop.growthPeriod} months
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getScoreColor(crop.suitabilityScore)} border-0`}>
                          {crop.suitabilityScore}%
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {crop.profitMargin}% profit
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}