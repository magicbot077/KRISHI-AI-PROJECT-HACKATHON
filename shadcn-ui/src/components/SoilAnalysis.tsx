import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  Droplets, 
  Leaf, 
  Activity,
  MapPin,
  Camera,
  Upload,
  RefreshCw
} from 'lucide-react';
import { SoilData } from '@/lib/aiModel';

export default function SoilAnalysis() {
  const [soilData, setSoilData] = useState<SoilData>({
    pH: 6.8,
    moisture: 65,
    nitrogen: 280,
    phosphorus: 45,
    potassium: 180,
    organicMatter: 2.8
  });

  const [analyzing, setAnalyzing] = useState(false);

  const handleInputChange = (field: keyof SoilData, value: string) => {
    setSoilData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const analyzeSoil = async () => {
    setAnalyzing(true);
    // Simulate soil analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAnalyzing(false);
  };

  const getSoilHealthScore = () => {
    let score = 0;
    
    // pH score (0-20 points)
    if (soilData.pH >= 6.0 && soilData.pH <= 7.5) score += 20;
    else if (soilData.pH >= 5.5 && soilData.pH <= 8.0) score += 15;
    else score += 10;
    
    // Moisture score (0-20 points)
    if (soilData.moisture >= 50 && soilData.moisture <= 80) score += 20;
    else if (soilData.moisture >= 40 && soilData.moisture <= 90) score += 15;
    else score += 10;
    
    // Nutrient scores (0-60 points total, 20 each)
    if (soilData.nitrogen >= 250) score += 20;
    else if (soilData.nitrogen >= 150) score += 15;
    else score += 10;
    
    if (soilData.phosphorus >= 40) score += 20;
    else if (soilData.phosphorus >= 25) score += 15;
    else score += 10;
    
    if (soilData.potassium >= 150) score += 20;
    else if (soilData.potassium >= 100) score += 15;
    else score += 10;
    
    return Math.min(100, score);
  };

  const getParameterStatus = (value: number, optimal: [number, number], unit: string) => {
    const [min, max] = optimal;
    if (value >= min && value <= max) {
      return { status: 'optimal', color: 'bg-green-100 text-green-800', text: 'Optimal' };
    } else if (value < min) {
      return { status: 'low', color: 'bg-red-100 text-red-800', text: 'Low' };
    } else {
      return { status: 'high', color: 'bg-yellow-100 text-yellow-800', text: 'High' };
    }
  };

  const soilHealthScore = getSoilHealthScore();

  const soilParameters = [
    {
      name: 'pH Level',
      nameHindi: 'पीएच स्तर',
      value: soilData.pH,
      unit: '',
      optimal: [6.0, 7.5] as [number, number],
      icon: <TestTube className="h-4 w-4" />,
      description: 'Soil acidity/alkalinity level'
    },
    {
      name: 'Moisture',
      nameHindi: 'नमी',
      value: soilData.moisture,
      unit: '%',
      optimal: [50, 80] as [number, number],
      icon: <Droplets className="h-4 w-4" />,
      description: 'Soil water content'
    },
    {
      name: 'Nitrogen (N)',
      nameHindi: 'नाइट्रोजन',
      value: soilData.nitrogen,
      unit: 'kg/ha',
      optimal: [250, 400] as [number, number],
      icon: <Leaf className="h-4 w-4" />,
      description: 'Essential for plant growth'
    },
    {
      name: 'Phosphorus (P)',
      nameHindi: 'फास्फोरस',
      value: soilData.phosphorus,
      unit: 'kg/ha',
      optimal: [40, 80] as [number, number],
      icon: <Activity className="h-4 w-4" />,
      description: 'Important for root development'
    },
    {
      name: 'Potassium (K)',
      nameHindi: 'पोटैशियम',
      value: soilData.potassium,
      unit: 'kg/ha',
      optimal: [150, 300] as [number, number],
      icon: <Leaf className="h-4 w-4" />,
      description: 'Helps in disease resistance'
    },
    {
      name: 'Organic Matter',
      nameHindi: 'जैविक पदार्थ',
      value: soilData.organicMatter,
      unit: '%',
      optimal: [2.5, 5.0] as [number, number],
      icon: <Activity className="h-4 w-4" />,
      description: 'Improves soil structure'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Soil Analysis
          </h2>
          <p className="text-gray-600">
            मिट्टी विश्लेषण - Monitor and optimize your soil health
          </p>
        </div>
        <Button 
          onClick={analyzeSoil} 
          disabled={analyzing}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {analyzing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <TestTube className="h-4 w-4 mr-2" />
          )}
          {analyzing ? 'Analyzing...' : 'Analyze Soil'}
        </Button>
      </div>

      <Tabs defaultValue="parameters" className="space-y-6">
        <TabsList>
          <TabsTrigger value="parameters">Soil Parameters</TabsTrigger>
          <TabsTrigger value="input">Manual Input</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters" className="space-y-6">
          {/* Soil Health Score */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Overall Soil Health Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{soilHealthScore}/100</p>
                  <p className="text-sm text-gray-600">
                    {soilHealthScore >= 80 ? 'Excellent' : 
                     soilHealthScore >= 60 ? 'Good' : 
                     soilHealthScore >= 40 ? 'Fair' : 'Poor'} Health
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={
                    soilHealthScore >= 80 ? 'bg-green-100 text-green-800' :
                    soilHealthScore >= 60 ? 'bg-blue-100 text-blue-800' :
                    soilHealthScore >= 40 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {soilHealthScore >= 80 ? '🌟 Excellent' : 
                     soilHealthScore >= 60 ? '👍 Good' : 
                     soilHealthScore >= 40 ? '⚠️ Fair' : '❌ Poor'}
                  </Badge>
                </div>
              </div>
              <Progress value={soilHealthScore} className="h-3" />
            </CardContent>
          </Card>

          {/* Soil Parameters Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {soilParameters.map((param) => {
              const status = getParameterStatus(param.value, param.optimal, param.unit);
              return (
                <Card key={param.name} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {param.icon}
                        <div>
                          <CardTitle className="text-sm">{param.name}</CardTitle>
                          <p className="text-xs text-gray-600">{param.nameHindi}</p>
                        </div>
                      </div>
                      <Badge className={`${status.color} border-0`}>
                        {status.text}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold">
                        {param.value}{param.unit}
                      </p>
                      <p className="text-xs text-gray-600">
                        Optimal: {param.optimal[0]}-{param.optimal[1]}{param.unit}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Low</span>
                        <span>Optimal</span>
                        <span>High</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (param.value / param.optimal[1]) * 100)} 
                        className="h-2" 
                      />
                    </div>
                    <p className="text-xs text-gray-600">{param.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="input" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Input Soil Data
              </CardTitle>
              <p className="text-sm text-gray-600">
                Enter soil test results manually or upload from IoT sensors
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Upload Options */}
              <div className="grid md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Camera className="h-6 w-6" />
                  <span className="text-sm">Photo Analysis</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Upload className="h-6 w-6" />
                  <span className="text-sm">Upload Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <MapPin className="h-6 w-6" />
                  <span className="text-sm">GPS Location</span>
                </Button>
              </div>

              {/* Manual Input Form */}
              <div className="grid md:grid-cols-2 gap-6">
                {soilParameters.map((param) => (
                  <div key={param.name} className="space-y-2">
                    <Label htmlFor={param.name} className="flex items-center gap-2">
                      {param.icon}
                      {param.name} ({param.nameHindi})
                    </Label>
                    <Input
                      id={param.name}
                      type="number"
                      step="0.1"
                      value={param.value}
                      onChange={(e) => handleInputChange(param.name.toLowerCase().replace(/[^a-z]/g, '') as keyof SoilData, e.target.value)}
                      placeholder={`Enter ${param.name.toLowerCase()}`}
                    />
                    <p className="text-xs text-gray-600">
                      Optimal range: {param.optimal[0]}-{param.optimal[1]}{param.unit}
                    </p>
                  </div>
                ))}
              </div>

              <Button onClick={analyzeSoil} className="w-full">
                <TestTube className="h-4 w-4 mr-2" />
                Update Soil Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">
                  ✅ Soil Improvement Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {soilHealthScore < 60 && (
                    <p className="text-sm">• Add organic compost to improve soil structure</p>
                  )}
                  {soilData.pH < 6.0 && (
                    <p className="text-sm">• Apply lime to reduce soil acidity</p>
                  )}
                  {soilData.pH > 7.5 && (
                    <p className="text-sm">• Add sulfur or organic matter to reduce alkalinity</p>
                  )}
                  {soilData.nitrogen < 250 && (
                    <p className="text-sm">• Apply nitrogen-rich fertilizers or plant legumes</p>
                  )}
                  {soilData.phosphorus < 40 && (
                    <p className="text-sm">• Use phosphorus fertilizers like DAP</p>
                  )}
                  {soilData.potassium < 150 && (
                    <p className="text-sm">• Apply potassium chloride or wood ash</p>
                  )}
                  {soilData.organicMatter < 2.5 && (
                    <p className="text-sm">• Increase organic matter with compost and crop residues</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-700">
                  📊 Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <p>• Schedule soil testing every 6 months</p>
                  <p>• Monitor moisture levels weekly</p>
                  <p>• Implement crop rotation for better soil health</p>
                  <p>• Consider cover crops during off-season</p>
                  <p>• Install soil sensors for real-time monitoring</p>
                  <p>• Consult with local agricultural extension officer</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}