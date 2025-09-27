import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter,
  Heart,
  HeartOff,
  Bell,
  BellOff,
  Table,
  Grid,
  MapPin,
  Calendar,
  DollarSign,
  Wheat,
  Apple,
  Loader2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MandiPriceService, type MandiPriceData, type FavoriteCrop, type PriceAlert, type PriceTrend } from '../utils/mandiApi';

const MarketDashboard: React.FC = () => {
  const [priceData, setPriceData] = useState<MandiPriceData[]>([]);
  const [filteredData, setFilteredData] = useState<MandiPriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedCommodity, setSelectedCommodity] = useState<string>('');
  const [selectedMarket, setSelectedMarket] = useState<string>('');
  
  // Filter options
  const [states, setStates] = useState<string[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);
  const [markets, setMarkets] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  
  // Features
  const [favorites, setFavorites] = useState<FavoriteCrop[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [selectedCropForTrend, setSelectedCropForTrend] = useState<string>('');
  const [priceTrend, setPriceTrend] = useState<PriceTrend[]>([]);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertForm, setAlertForm] = useState({
    commodity: '',
    variety: '',
    market: '',
    threshold: '',
    type: 'above' as 'above' | 'below'
  });

  useEffect(() => {
    loadInitialData();
    loadFavorites();
    loadAlerts();
    MandiPriceService.requestNotificationPermission();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [priceData, searchTerm, selectedState, selectedDistrict, selectedCommodity, selectedMarket]);

  useEffect(() => {
    if (selectedCropForTrend && priceData.length > 0) {
      const trend = MandiPriceService.generatePriceTrend(priceData, selectedCropForTrend);
      setPriceTrend(trend);
    }
  }, [selectedCropForTrend, priceData]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [data, uniqueValues] = await Promise.all([
        MandiPriceService.fetchMandiPrices({ limit: 1000 }),
        MandiPriceService.getUniqueValues()
      ]);
      
      setPriceData(data);
      setStates(uniqueValues.states);
      setCommodities(uniqueValues.commodities);
      setMarkets(uniqueValues.markets);
      setDistricts(uniqueValues.districts);
      
      // Check for price alerts
      MandiPriceService.checkAlerts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    setFavorites(MandiPriceService.getFavorites());
  };

  const loadAlerts = () => {
    setAlerts(MandiPriceService.getAlerts());
  };

  const applyFilters = () => {
    let filtered = priceData;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variety.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.market.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedState) {
      filtered = filtered.filter(item => item.state === selectedState);
    }

    if (selectedDistrict) {
      filtered = filtered.filter(item => item.district === selectedDistrict);
    }

    if (selectedCommodity) {
      filtered = filtered.filter(item => item.commodity === selectedCommodity);
    }

    if (selectedMarket) {
      filtered = filtered.filter(item => item.market === selectedMarket);
    }

    setFilteredData(filtered);
  };

  const toggleFavorite = (item: MandiPriceData) => {
    const crop: FavoriteCrop = {
      commodity: item.commodity,
      variety: item.variety,
      market: item.market,
      state: item.state
    };

    if (MandiPriceService.isFavorite(crop)) {
      MandiPriceService.removeFromFavorites(crop);
    } else {
      MandiPriceService.addToFavorites(crop);
    }
    
    loadFavorites();
  };

  const handleAddAlert = () => {
    if (alertForm.commodity && alertForm.threshold) {
      MandiPriceService.addAlert({
        commodity: alertForm.commodity,
        variety: alertForm.variety || 'All',
        market: alertForm.market || 'All',
        threshold: parseFloat(alertForm.threshold),
        type: alertForm.type,
        isActive: true
      });
      
      setAlertForm({
        commodity: '',
        variety: '',
        market: '',
        threshold: '',
        type: 'above'
      });
      setShowAlertForm(false);
      loadAlerts();
    }
  };

  const removeAlert = (id: string) => {
    MandiPriceService.removeAlert(id);
    loadAlerts();
  };

  const getCropIcon = (commodity: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'wheat': <Wheat className="h-5 w-5" />,
      'rice': <Wheat className="h-5 w-5" />,
      'onion': <Apple className="h-5 w-5" />,
      'potato': <Apple className="h-5 w-5" />,
      'tomato': <Apple className="h-5 w-5" />,
      'default': <Wheat className="h-5 w-5" />
    };
    
    return icons[commodity.toLowerCase()] || icons.default;
  };

  const getPriceColor = (price: number, minPrice: number, maxPrice: number) => {
    const midPrice = (minPrice + maxPrice) / 2;
    if (price >= midPrice) return 'text-green-600';
    if (price < midPrice * 0.8) return 'text-red-600';
    return 'text-yellow-600';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedCommodity('');
    setSelectedMarket('');
  };

  if (loading && priceData.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-green-600" />
          <p className="text-lg font-semibold">Loading Market Data...</p>
          <p className="text-gray-600">Fetching latest prices from Government of India Mandi Database</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Market Intelligence</h2>
          <p className="text-gray-600">Live prices from Government of India Mandi Database</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadInitialData}
            disabled={loading}
            variant="outline"
            className="border-green-200 hover:bg-green-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          <Button
            onClick={() => setShowAlertForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Bell className="h-4 w-4 mr-2" />
            Add Alert
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="prices" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-green-50">
          <TabsTrigger value="prices" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Live Prices
          </TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Favorites ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Price Trends
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Alerts ({alerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="space-y-6">
          {/* Filters */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Filter className="h-5 w-5" />
                Filter Market Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search commodity, variety, market..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCommodity} onValueChange={setSelectedCommodity}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Commodity" />
                  </SelectTrigger>
                  <SelectContent>
                    {commodities.map(commodity => (
                      <SelectItem key={commodity} value={commodity}>{commodity}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map(district => (
                      <SelectItem key={district} value={district}>{district}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedMarket} onValueChange={setSelectedMarket}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Market" />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map(market => (
                      <SelectItem key={market} value={market}>{market}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button onClick={clearFilters} variant="outline" className="border-gray-300">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* View Toggle */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredData.length} of {priceData.length} records
            </p>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className={viewMode === 'cards' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={viewMode === 'table' ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                <Table className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Data Display */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item, index) => {
                const crop: FavoriteCrop = {
                  commodity: item.commodity,
                  variety: item.variety,
                  market: item.market,
                  state: item.state
                };
                const isFav = MandiPriceService.isFavorite(crop);

                return (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            {getCropIcon(item.commodity)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{item.commodity}</h3>
                            <p className="text-sm text-gray-600">{item.variety}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(item)}
                          className="text-red-500 hover:text-red-600"
                        >
                          {isFav ? <Heart className="h-4 w-4 fill-current" /> : <HeartOff className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-red-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Min</p>
                          <p className="font-semibold text-red-600">{formatPrice(item.min_price)}</p>
                        </div>
                        <div className="bg-green-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Modal</p>
                          <p className="font-bold text-green-600 text-lg">{formatPrice(item.modal_price)}</p>
                        </div>
                        <div className="bg-blue-50 p-2 rounded">
                          <p className="text-xs text-gray-600">Max</p>
                          <p className="font-semibold text-blue-600">{formatPrice(item.max_price)}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>{item.market}, {item.district}, {item.state}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(item.arrival_date).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="secondary" className="bg-gray-100">
                          Grade: {item.grade}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="text-left p-4 font-semibold">Commodity</th>
                        <th className="text-left p-4 font-semibold">Variety</th>
                        <th className="text-left p-4 font-semibold">Market</th>
                        <th className="text-left p-4 font-semibold">State</th>
                        <th className="text-right p-4 font-semibold">Min Price</th>
                        <th className="text-right p-4 font-semibold">Modal Price</th>
                        <th className="text-right p-4 font-semibold">Max Price</th>
                        <th className="text-left p-4 font-semibold">Date</th>
                        <th className="text-center p-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item, index) => {
                        const crop: FavoriteCrop = {
                          commodity: item.commodity,
                          variety: item.variety,
                          market: item.market,
                          state: item.state
                        };
                        const isFav = MandiPriceService.isFavorite(crop);

                        return (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {getCropIcon(item.commodity)}
                                <span className="font-medium">{item.commodity}</span>
                              </div>
                            </td>
                            <td className="p-4">{item.variety}</td>
                            <td className="p-4">{item.market}</td>
                            <td className="p-4">{item.state}</td>
                            <td className="p-4 text-right font-semibold text-red-600">
                              {formatPrice(item.min_price)}
                            </td>
                            <td className="p-4 text-right font-bold text-green-600 text-lg">
                              {formatPrice(item.modal_price)}
                            </td>
                            <td className="p-4 text-right font-semibold text-blue-600">
                              {formatPrice(item.max_price)}
                            </td>
                            <td className="p-4">{new Date(item.arrival_date).toLocaleDateString()}</td>
                            <td className="p-4 text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFavorite(item)}
                                className="text-red-500 hover:text-red-600"
                              >
                                {isFav ? <Heart className="h-4 w-4 fill-current" /> : <HeartOff className="h-4 w-4" />}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Heart className="h-5 w-5" />
                Your Favorite Crops
              </CardTitle>
            </CardHeader>
            <CardContent>
              {favorites.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No favorite crops yet. Add some from the Live Prices tab!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((fav, index) => {
                    const currentData = priceData.find(item =>
                      item.commodity === fav.commodity &&
                      item.variety === fav.variety &&
                      item.market === fav.market
                    );

                    return (
                      <Card key={index} className="border-green-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              {getCropIcon(fav.commodity)}
                              <div>
                                <h4 className="font-semibold">{fav.commodity}</h4>
                                <p className="text-sm text-gray-600">{fav.variety}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => MandiPriceService.removeFromFavorites(fav)}
                              className="text-red-500"
                            >
                              <Heart className="h-4 w-4 fill-current" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{fav.market}, {fav.state}</p>
                          {currentData && (
                            <div className="bg-green-50 p-2 rounded text-center">
                              <p className="text-sm text-gray-600">Current Price</p>
                              <p className="font-bold text-green-600">{formatPrice(currentData.modal_price)}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <TrendingUp className="h-5 w-5" />
                Price Trend Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedCropForTrend} onValueChange={setSelectedCropForTrend}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="Select commodity for trend analysis" />
                </SelectTrigger>
                <SelectContent>
                  {commodities.map(commodity => (
                    <SelectItem key={commodity} value={commodity}>{commodity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {priceTrend.length > 0 && (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                      />
                      <YAxis 
                        tickFormatter={(price) => `₹${price}`}
                      />
                      <Tooltip 
                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                        formatter={(price) => [`₹${price}`, 'Price']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#16a34a" 
                        strokeWidth={3}
                        dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Bell className="h-5 w-5" />
                Price Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No price alerts set. Create one to get notified!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className="border-yellow-200">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{alert.commodity} - {alert.variety}</h4>
                            <p className="text-sm text-gray-600">{alert.market}</p>
                            <p className="text-sm">
                              Alert when price goes {alert.type} ₹{alert.threshold}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAlert(alert.id)}
                            className="text-red-500"
                          >
                            <BellOff className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Alert Form Modal */}
      {showAlertForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Price Alert</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={alertForm.commodity} onValueChange={(value) => setAlertForm({...alertForm, commodity: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Commodity" />
                </SelectTrigger>
                <SelectContent>
                  {commodities.map(commodity => (
                    <SelectItem key={commodity} value={commodity}>{commodity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Variety (optional)"
                value={alertForm.variety}
                onChange={(e) => setAlertForm({...alertForm, variety: e.target.value})}
              />

              <Input
                placeholder="Market (optional)"
                value={alertForm.market}
                onChange={(e) => setAlertForm({...alertForm, market: e.target.value})}
              />

              <Input
                type="number"
                placeholder="Price threshold (₹)"
                value={alertForm.threshold}
                onChange={(e) => setAlertForm({...alertForm, threshold: e.target.value})}
              />

              <Select value={alertForm.type} onValueChange={(value: 'above' | 'below') => setAlertForm({...alertForm, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="above">Alert when price goes above</SelectItem>
                  <SelectItem value="below">Alert when price goes below</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddAlert} className="flex-1 bg-green-600 hover:bg-green-700">
                  Create Alert
                </Button>
                <Button onClick={() => setShowAlertForm(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MarketDashboard;