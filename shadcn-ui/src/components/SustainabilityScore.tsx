import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Leaf, 
  Droplets, 
  Recycle,
  TreePine,
  Award,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Target
} from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface SustainabilityMetric {
  category: string;
  categoryHindi: string;
  score: number;
  maxScore: number;
  icon: React.ReactNode;
  color: string;
  description: string;
  improvements: string[];
}

export default function SustainabilityScore() {
  const [selectedMetric, setSelectedMetric] = useState<string>('soil');

  const sustainabilityMetrics: SustainabilityMetric[] = [
    {
      category: 'Soil Health',
      categoryHindi: 'मिट्टी का स्वास्थ्य',
      score: 78,
      maxScore: 100,
      icon: <Leaf className="h-5 w-5" />,
      color: '#10b981',
      description: 'Organic matter content, pH balance, and nutrient cycling',
      improvements: [
        'Increase organic matter through composting',
        'Implement cover cropping',
        'Reduce tillage practices',
        'Practice crop rotation'
      ]
    },
    {
      category: 'Water Management',
      categoryHindi: 'जल प्रबंधन',
      score: 65,
      maxScore: 100,
      icon: <Droplets className="h-5 w-5" />,
      color: '#3b82f6',
      description: 'Water usage efficiency, conservation, and quality protection',
      improvements: [
        'Install drip irrigation system',
        'Harvest rainwater',
        'Use drought-resistant varieties',
        'Monitor soil moisture levels'
      ]
    },
    {
      category: 'Carbon Footprint',
      categoryHindi: 'कार्बन पदचिह्न',
      score: 72,
      maxScore: 100,
      icon: <Recycle className="h-5 w-5" />,
      color: '#8b5cf6',
      description: 'Greenhouse gas emissions and carbon sequestration',
      improvements: [
        'Reduce synthetic fertilizer use',
        'Adopt no-till farming',
        'Plant trees on farm boundaries',
        'Use renewable energy sources'
      ]
    },
    {
      category: 'Biodiversity',
      categoryHindi: 'जैव विविधता',
      score: 58,
      maxScore: 100,
      icon: <TreePine className="h-5 w-5" />,
      color: '#f59e0b',
      description: 'Species diversity, habitat conservation, and ecosystem health',
      improvements: [
        'Create wildlife corridors',
        'Plant native species',
        'Reduce pesticide usage',
        'Maintain hedgerows and buffer zones'
      ]
    }
  ];

  const overallScore = Math.round(
    sustainabilityMetrics.reduce((sum, metric) => sum + metric.score, 0) / sustainabilityMetrics.length
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { text: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { text: 'Good', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 40) return { text: 'Fair', color: 'bg-orange-100 text-orange-800' };
    return { text: 'Poor', color: 'bg-red-100 text-red-800' };
  };

  const radialData = sustainabilityMetrics.map(metric => ({
    name: metric.category,
    score: metric.score,
    fill: metric.color
  }));

  const comparisonData = [
    { category: 'Your Farm', soil: 78, water: 65, carbon: 72, biodiversity: 58 },
    { category: 'Regional Average', soil: 65, water: 58, carbon: 60, biodiversity: 52 },
    { category: 'Best Practices', soil: 90, water: 85, carbon: 88, biodiversity: 82 }
  ];

  const certifications = [
    { name: 'Organic Certification', status: 'eligible', icon: '🌱' },
    { name: 'Carbon Credit Program', status: 'partial', icon: '🌍' },
    { name: 'Sustainable Agriculture', status: 'achieved', icon: '🏆' },
    { name: 'Water Stewardship', status: 'in-progress', icon: '💧' }
  ];

  const getCertificationColor = (status: string) => {
    switch (status) {
      case 'achieved': return 'bg-green-100 text-green-800';
      case 'eligible': return 'bg-blue-100 text-blue-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Sustainability Dashboard
          </h2>
          <p className="text-gray-600">
            स्थिरता डैशबोर्ड - Monitor and improve your farm's environmental impact
          </p>
        </div>
        <Badge className={`${getScoreBadge(overallScore).color} border-0 text-lg px-4 py-2`}>
          <Award className="h-4 w-4 mr-2" />
          {overallScore}/100
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="improvements">Action Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overall Score */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    Overall Sustainability Score
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your farm's environmental performance rating
                  </p>
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                      {overallScore}/100
                    </div>
                    <Badge className={`${getScoreBadge(overallScore).color} border-0`}>
                      {getScoreBadge(overallScore).text}
                    </Badge>
                  </div>
                </div>
                <div className="text-6xl opacity-20">
                  🌱
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sustainabilityMetrics.map((metric) => (
              <Card 
                key={metric.category} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedMetric(metric.category.toLowerCase().replace(' ', ''))}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2" style={{ color: metric.color }}>
                      {metric.icon}
                      <div>
                        <CardTitle className="text-sm">{metric.category}</CardTitle>
                        <p className="text-xs text-gray-600">{metric.categoryHindi}</p>
                      </div>
                    </div>
                    <Badge className={`${getScoreBadge(metric.score).color} border-0`}>
                      {metric.score}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Progress value={metric.score} className="h-2" />
                  <p className="text-xs text-gray-600">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Radial Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Sustainability Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={radialData}>
                    <RadialBar dataKey="score" cornerRadius={10} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          {/* Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
              <p className="text-sm text-gray-600">
                Compare your farm's sustainability metrics with regional averages and best practices
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="soil" fill="#10b981" name="Soil Health" />
                    <Bar dataKey="water" fill="#3b82f6" name="Water Management" />
                    <Bar dataKey="carbon" fill="#8b5cf6" name="Carbon Footprint" />
                    <Bar dataKey="biodiversity" fill="#f59e0b" name="Biodiversity" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Metrics */}
          <div className="grid md:grid-cols-2 gap-6">
            {sustainabilityMetrics.map((metric) => (
              <Card key={metric.category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: metric.color }}>
                    {metric.icon}
                    {metric.category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{metric.score}/100</span>
                    <Badge className={`${getScoreBadge(metric.score).color} border-0`}>
                      {getScoreBadge(metric.score).text}
                    </Badge>
                  </div>
                  <Progress value={metric.score} className="h-3" />
                  <p className="text-sm text-gray-600">{metric.description}</p>
                  
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Key Improvements:</h5>
                    <ul className="space-y-1">
                      {metric.improvements.slice(0, 2).map((improvement, index) => (
                        <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                          <Target className="h-3 w-3 mt-0.5 text-green-600" />
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {certifications.map((cert) => (
              <Card key={cert.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cert.icon}</span>
                      <div>
                        <h4 className="font-semibold">{cert.name}</h4>
                        <Badge className={`${getCertificationColor(cert.status)} border-0 mt-1`}>
                          {cert.status.replace('-', ' ')}
                        </Badge>
                      </div>
                    </div>
                    {cert.status === 'achieved' ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-orange-600" />
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {cert.status === 'achieved' && (
                      <p className="text-green-700">✅ Certification achieved! Valid until 2025.</p>
                    )}
                    {cert.status === 'eligible' && (
                      <p className="text-blue-700">📋 You meet the requirements. Apply now!</p>
                    )}
                    {cert.status === 'partial' && (
                      <p className="text-yellow-700">⚠️ 2 more requirements needed for certification.</p>
                    )}
                    {cert.status === 'in-progress' && (
                      <p className="text-orange-700">🔄 Application under review. Expected completion: 30 days.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700">💰 Certification Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Financial Incentives:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Premium pricing: 10-30% above market rates</li>
                    <li>• Government subsidies and tax benefits</li>
                    <li>• Access to carbon credit markets</li>
                    <li>• Reduced insurance premiums</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Market Access:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Export opportunities to premium markets</li>
                    <li>• Direct contracts with organic retailers</li>
                    <li>• Participation in sustainable supply chains</li>
                    <li>• Brand differentiation and marketing advantage</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="improvements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Sustainability Action Plan
              </CardTitle>
              <p className="text-sm text-gray-600">
                Prioritized recommendations to improve your sustainability score
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sustainabilityMetrics
                  .sort((a, b) => a.score - b.score)
                  .map((metric, index) => (
                    <div key={metric.category} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Priority {index + 1}
                          </Badge>
                          <h4 className="font-semibold flex items-center gap-2" style={{ color: metric.color }}>
                            {metric.icon}
                            {metric.category}
                          </h4>
                        </div>
                        <span className="text-sm text-gray-600">Current: {metric.score}/100</span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Immediate Actions (0-3 months):</h5>
                          <ul className="space-y-1">
                            {metric.improvements.slice(0, 2).map((improvement, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-2">Long-term Goals (3-12 months):</h5>
                          <ul className="space-y-1">
                            {metric.improvements.slice(2).map((improvement, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <Target className="h-4 w-4 mt-0.5 text-blue-600" />
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">🎯 Quick Wins</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Start composting organic waste (+5 points)</li>
                  <li>• Install water-efficient irrigation (+8 points)</li>
                  <li>• Plant cover crops in off-season (+6 points)</li>
                  <li>• Reduce synthetic fertilizer by 20% (+7 points)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-700">📈 Potential Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>• Implementing all recommendations could increase your score to <strong>85+</strong></p>
                  <p>• Estimated additional income: <strong>₹15,000-25,000/year</strong></p>
                  <p>• Carbon footprint reduction: <strong>30-40%</strong></p>
                  <p>• Water usage reduction: <strong>25-35%</strong></p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}