export interface MandiPriceData {
  state: string;
  district: string;
  market: string;
  commodity: string;
  variety: string;
  grade: string;
  arrival_date: string;
  min_price: number;
  max_price: number;
  modal_price: number;
}

export interface PriceTrend {
  date: string;
  price: number;
}

export interface FavoriteCrop {
  commodity: string;
  variety: string;
  market: string;
  state: string;
}

export interface PriceAlert {
  id: string;
  commodity: string;
  variety: string;
  market: string;
  threshold: number;
  type: 'above' | 'below';
  isActive: boolean;
  createdAt: string;
}

const API_KEY = '579b464db66ec23bdd000001d18ba5c562e6427e4d5fef1cd6e41315';
const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

export class MandiPriceService {
  private static readonly CACHE_KEY = 'krishiAI_mandi_cache';
  private static readonly FAVORITES_KEY = 'krishiAI_favorite_crops';
  private static readonly ALERTS_KEY = 'krishiAI_price_alerts';
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  static async fetchMandiPrices(filters?: {
    state?: string;
    district?: string;
    market?: string;
    commodity?: string;
    limit?: number;
    offset?: number;
  }): Promise<MandiPriceData[]> {
    try {
      // Check cache first
      const cached = this.getCachedData();
      if (cached && this.isCacheValid(cached.timestamp)) {
        return this.filterData(cached.data, filters);
      }

      const params = new URLSearchParams({
        'api-key': API_KEY,
        format: 'json',
        limit: (filters?.limit || 1000).toString(),
        offset: (filters?.offset || 0).toString()
      });

      if (filters?.state) params.append('filters[state]', filters.state);
      if (filters?.district) params.append('filters[district]', filters.district);
      if (filters?.market) params.append('filters[market]', filters.market);
      if (filters?.commodity) params.append('filters[commodity]', filters.commodity);

      const response = await fetch(`${BASE_URL}?${params}`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      const data = result.records || [];
      
      // Transform data with proper date handling
      const transformedData: MandiPriceData[] = data.map((item: Record<string, unknown>) => {
        // Format the arrival date properly
        let formattedDate = new Date().toISOString().split('T')[0]; // default to today
        
        if (item.arrival_date) {
          try {
            // Parse the incoming date string
            const date = new Date(String(item.arrival_date));
            if (!isNaN(date.getTime())) {
              formattedDate = date.toISOString().split('T')[0];
            }
          } catch (e) {
            console.warn('Invalid date format:', item.arrival_date);
          }
        }

        return {
          state: String(item.state || 'Unknown'),
          district: String(item.district || 'Unknown'),
          market: String(item.market || 'Unknown'),
          commodity: String(item.commodity || 'Unknown'),
          variety: String(item.variety || 'Unknown'),
          grade: String(item.grade || 'Unknown'),
          arrival_date: formattedDate,
          min_price: parseFloat(String(item.min_price)) || 0,
          max_price: parseFloat(String(item.max_price)) || 0,
          modal_price: parseFloat(String(item.modal_price)) || 0
        };
      });

      // Cache the data
      this.cacheData(transformedData);
      
      return transformedData;
    } catch (error) {
      console.error('Mandi API Error:', error);
      
      // Return cached data if available, even if expired
      const cached = this.getCachedData();
      if (cached) {
        return this.filterData(cached.data, filters);
      }
      
      // Return mock data as last resort
      return this.getMockData();
    }
  }

  static async getUniqueValues(): Promise<{
    states: string[];
    commodities: string[];
    markets: string[];
    districts: string[];
  }> {
    try {
      const data = await this.fetchMandiPrices({ limit: 5000 });
      
      return {
        states: [...new Set(data.map(item => item.state))].sort(),
        commodities: [...new Set(data.map(item => item.commodity))].sort(),
        markets: [...new Set(data.map(item => item.market))].sort(),
        districts: [...new Set(data.map(item => item.district))].sort()
      };
    } catch (error) {
      console.error('Error fetching unique values:', error);
      return {
        states: ['Maharashtra', 'Punjab', 'Uttar Pradesh', 'Karnataka', 'Gujarat'],
        commodities: ['Wheat', 'Rice', 'Onion', 'Potato', 'Tomato', 'Cotton'],
        markets: ['APMC Market', 'Mandi', 'Wholesale Market'],
        districts: ['Mumbai', 'Pune', 'Delhi', 'Bangalore', 'Chennai']
      };
    }
  }

  static generatePriceTrend(data: MandiPriceData[], commodity: string, days: number = 7): PriceTrend[] {
    const filtered = data
      .filter(item => item.commodity.toLowerCase() === commodity.toLowerCase())
      .sort((a, b) => new Date(b.arrival_date).getTime() - new Date(a.arrival_date).getTime())
      .slice(0, days);

    return filtered.map(item => ({
      date: item.arrival_date,
      price: item.modal_price
    })).reverse();
  }

  // Favorites Management
  static getFavorites(): FavoriteCrop[] {
    try {
      const saved = localStorage.getItem(this.FAVORITES_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  static addToFavorites(crop: FavoriteCrop): void {
    const favorites = this.getFavorites();
    const exists = favorites.some(fav => 
      fav.commodity === crop.commodity && 
      fav.variety === crop.variety && 
      fav.market === crop.market
    );
    
    if (!exists) {
      favorites.push(crop);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
    }
  }

  static removeFromFavorites(crop: FavoriteCrop): void {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(fav => 
      !(fav.commodity === crop.commodity && 
        fav.variety === crop.variety && 
        fav.market === crop.market)
    );
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(filtered));
  }

  static isFavorite(crop: FavoriteCrop): boolean {
    const favorites = this.getFavorites();
    return favorites.some(fav => 
      fav.commodity === crop.commodity && 
      fav.variety === crop.variety && 
      fav.market === crop.market
    );
  }

  // Price Alerts Management
  static getAlerts(): PriceAlert[] {
    try {
      const saved = localStorage.getItem(this.ALERTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  static addAlert(alert: Omit<PriceAlert, 'id' | 'createdAt'>): void {
    const alerts = this.getAlerts();
    const newAlert: PriceAlert = {
      ...alert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    alerts.push(newAlert);
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(alerts));
  }

  static removeAlert(id: string): void {
    const alerts = this.getAlerts();
    const filtered = alerts.filter(alert => alert.id !== id);
    localStorage.setItem(this.ALERTS_KEY, JSON.stringify(filtered));
  }

  static checkAlerts(data: MandiPriceData[]): PriceAlert[] {
    const alerts = this.getAlerts().filter(alert => alert.isActive);
    const triggeredAlerts: PriceAlert[] = [];

    alerts.forEach(alert => {
      const matchingData = data.find(item => 
        item.commodity.toLowerCase() === alert.commodity.toLowerCase() &&
        item.variety.toLowerCase() === alert.variety.toLowerCase() &&
        item.market.toLowerCase() === alert.market.toLowerCase()
      );

      if (matchingData) {
        const currentPrice = matchingData.modal_price;
        const shouldTrigger = alert.type === 'above' 
          ? currentPrice >= alert.threshold
          : currentPrice <= alert.threshold;

        if (shouldTrigger) {
          triggeredAlerts.push(alert);
          this.showNotification(alert, currentPrice);
        }
      }
    });

    return triggeredAlerts;
  }

  private static showNotification(alert: PriceAlert, currentPrice: number): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Price Alert: ${alert.commodity}`, {
        body: `${alert.variety} in ${alert.market} is now ₹${currentPrice}/quintal (Threshold: ₹${alert.threshold})`,
        icon: '/favicon.ico'
      });
    }
  }

  static requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  // Cache Management
  private static cacheData(data: MandiPriceData[]): void {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
  }

  private static getCachedData(): { data: MandiPriceData[]; timestamp: number } | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  private static isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private static filterData(data: MandiPriceData[], filters?: {
    state?: string;
    district?: string;
    market?: string;
    commodity?: string;
    limit?: number;
  }): MandiPriceData[] {
    let filtered = data;

    if (filters?.state) {
      filtered = filtered.filter(item => 
        item.state.toLowerCase().includes(filters.state!.toLowerCase())
      );
    }
    if (filters?.district) {
      filtered = filtered.filter(item => 
        item.district.toLowerCase().includes(filters.district!.toLowerCase())
      );
    }
    if (filters?.market) {
      filtered = filtered.filter(item => 
        item.market.toLowerCase().includes(filters.market!.toLowerCase())
      );
    }
    if (filters?.commodity) {
      filtered = filtered.filter(item => 
        item.commodity.toLowerCase().includes(filters.commodity!.toLowerCase())
      );
    }

    return filters?.limit ? filtered.slice(0, filters.limit) : filtered;
  }

  private static getMockData(): MandiPriceData[] {
    return [
      {
        state: 'Maharashtra',
        district: 'Pune',
        market: 'Pune APMC',
        commodity: 'Onion',
        variety: 'Red',
        grade: 'FAQ',
        arrival_date: new Date().toISOString().split('T')[0],
        min_price: 1500,
        max_price: 2000,
        modal_price: 1750
      },
      {
        state: 'Punjab',
        district: 'Ludhiana',
        market: 'Ludhiana Mandi',
        commodity: 'Wheat',
        variety: 'PBW-343',
        grade: 'FAQ',
        arrival_date: new Date().toISOString().split('T')[0],
        min_price: 2100,
        max_price: 2300,
        modal_price: 2200
      },
      {
        state: 'Karnataka',
        district: 'Bangalore',
        market: 'Bangalore APMC',
        commodity: 'Tomato',
        variety: 'Hybrid',
        grade: 'FAQ',
        arrival_date: new Date().toISOString().split('T')[0],
        min_price: 800,
        max_price: 1200,
        modal_price: 1000
      }
    ];
  }
}

// Default export for backward compatibility
export default MandiPriceService;