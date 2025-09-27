import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  TrendingUp, 
  IndianRupee,
  Leaf,
  Calendar,
  BarChart3
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface CostBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

export default function YieldCalculator() {
  const [farmArea, setFarmArea] = useState('5');
  const [selectedCrop, setSelectedCrop] = useState('rice');
  const [inputCosts, setInputCosts] = useState({
    seeds: 8000,
    fertilizer: 15000,
    pesticide: 5000,
    labor: 20000,
    machinery: 12000,
    irrigation: 8000,
    other: 3000
  });

  const cropData = {
    rice: { 
      name: 'Rice', 
      nameHindi: 'चावल',
      avgYield: 4.5, 
      marketPrice: 2650, 
      icon: '🌾',
      season: 'Kharif',
      duration: 4
    },
    wheat: { 
      name: 'Wheat', 
      nameHindi: 'गेहूं',
      avgYield: 3.2, 
      marketPrice: 2200, 
      icon: '🌾',
      season: 'Rabi',
      duration: 5
    },
    cotton: { 
      name: 'Cotton', 
      nameHindi: 'कपास',
      avgYield: 2.1, 
      marketPrice: 6800, 
      icon: '🌱',
      season: 'Kharif',
      duration: 6
    },
    maize: { 
      name: 'Maize', 
      nameHindi: 'मक्का',
      avgYield: 5.8, 
      marketPrice: 1950, 
      icon: '🌽',
      season: 'Kharif/Rabi',
      duration: 3
    },
    sugarcane: { 
      name: 'Sugarcane', 
      nameHindi: 'गन्ना',
      avgYield: 70, 
      marketPrice: 380, 
      icon: '🎋',
      season: 'Annual',
      duration: 12
    },
    soybean: { 
      name: 'Soybean', 
      nameHindi: 'सोयाबीन',
      avgYield: 2.3, 
      marketPrice: 4400, 
      icon: '🫘',
      season: 'Kharif',
      duration: 4
    }
  };

  const calculateResults = () => {
    const crop = cropData[selectedCrop as keyof typeof cropData];
    const area = parseFloat(farmArea) || 0;
    
    // Calculate total costs
    const totalCosts = Object.values(inputCosts).reduce((sum, cost) => sum + cost, 0);
    const costPerAcre = totalCosts / area;
    
    // Calculate yield and revenue
    const totalYield = crop.avgYield * area;
    const grossRevenue = totalYield * crop.marketPrice;
    const netProfit = grossRevenue - totalCosts;
    const profitMargin = ((netProfit / grossRevenue) * 100);
    const roi = ((netProfit / totalCosts) * 100);
    
    return {
      crop,
      area,
      totalCosts,
      costPerAcre,
      totalYield,
      grossRevenue,
      netProfit,
      profitMargin,
      roi
    };
  };

  const results = calculateResults();

  const costBreakdown: CostBreakdown[] = [
    { category: 'Labor', amount: inputCosts.labor, percentage: 0, color: '#10b981' },
    { category: 'Fertilizer', amount: inputCosts.fertilizer, percentage: 0, color: '#3b82f6' },
    { category: 'Machinery', amount: inputCosts.machinery, percentage: 0, color: '#8b5cf6' },
    { category: 'Seeds', amount: inputCosts.seeds, percentage: 0, color: '#f59e0b' },
    { category: 'Irrigation', amount: inputCosts.irrigation, percentage: 0, color: '#ef4444' },
    { category: 'Pesticide', amount: inputCosts.pesticide, percentage: 0, color: '#06b6d4' },
    { category: 'Other', amount: inputCosts.other, percentage: 0, color: '#84cc16' }
  ].map(item => ({
    ...item,
    percentage: (item.amount / results.totalCosts) * 100
  }));

  const monthlyProfitData = Array.from({ length: results.crop.duration }, (_, i) => ({
    month: `Month ${i + 1}`,
    investment: -results.totalCosts / results.crop.duration,
    revenue: i === results.crop.duration - 1 ? results.grossRevenue : 0,
    profit: i === results.crop.duration - 1 ? results.netProfit : -results.totalCosts / results.crop.duration
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Yield & Profit Calculator
          </CardTitle>
          <p className="text-sm text-gray-600">
            उत्पादन और लाभ कैलकुलेटर - Calculate expected yield and profit for your crops
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Form */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="farmArea">Farm Area (Acres)</Label>
              <Input
                id="farmArea"
                type="number"
                value={farmArea}
                onChange={(e) => setFarmArea(e.target.value)}
                placeholder="Enter farm area"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crop">Select Crop</Label>
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose crop" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(cropData).map(([key, crop]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span>{crop.icon}</span>
                        <span>{crop.name} ({crop.nameHindi})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Calculate
              </Button>
            </div>
          </div>

          {/* Cost Inputs */}
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(inputCosts).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize">
                  {key} (₹)
                </Label>
                <Input
                  id={key}
                  type="number"
                  value={value}
                  onChange={(e) => setInputCosts(prev => ({
                    ...prev,
                    [key]: parseInt(e.target.value) || 0
                  }))}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-green-50">
          <CardContent className="p-4 text-center">
            <Leaf className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Expected Yield</p>
            <p className="text-xl font-bold">{results.totalYield.toFixed(1)} tons</p>
            <p className="text-xs text-gray-500">{results.crop.avgYield} tons/acre</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="p-4 text-center">
            <IndianRupee className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Gross Revenue</p>
            <p className="text-xl font-bold">₹{results.grossRevenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">₹{results.crop.marketPrice}/ton</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Net Profit</p>
            <p className={`text-xl font-bold ${results.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{results.netProfit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">{results.profitMargin.toFixed(1)}% margin</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">ROI</p>
            <p className={`text-xl font-bold ${results.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {results.roi.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500">{results.crop.duration} months</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="amount"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {costBreakdown.map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span>{item.category}: ₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profit Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProfitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Bar dataKey="investment" fill="#ef4444" name="Investment" />
                  <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-green-700">💡 Financial Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Optimization Tips:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Reduce labor costs through mechanization</li>
                <li>• Buy fertilizers in bulk for better rates</li>
                <li>• Consider organic farming for premium pricing</li>
                <li>• Implement drip irrigation to save water costs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Risk Mitigation:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Consider crop insurance for weather protection</li>
                <li>• Diversify with multiple crops</li>
                <li>• Use forward contracts for price stability</li>
                <li>• Maintain emergency fund for unexpected costs</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Break-even yield:</span>
              <Badge variant="outline">
                {(results.totalCosts / results.crop.marketPrice / parseFloat(farmArea)).toFixed(1)} tons/acre
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}