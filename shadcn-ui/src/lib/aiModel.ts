// AI/ML Model Simulation for Crop Recommendation System
// In production, this would connect to actual ML models and APIs

export interface SoilData {
  pH: number;
  moisture: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  organicMatter: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  season: 'kharif' | 'rabi' | 'zaid';
}

export interface MarketData {
  crop: string;
  price: number;
  demand: 'high' | 'medium' | 'low';
  trend: 'rising' | 'stable' | 'falling';
}

export interface CropRecommendation {
  id: string;
  name: string;
  nameHindi: string;
  suitabilityScore: number;
  expectedYield: number;
  profitMargin: number;
  sustainabilityScore: number;
  waterRequirement: 'low' | 'medium' | 'high';
  growthPeriod: number; // in months
  marketPrice: number;
  image: string;
  pros: string[];
  cons: string[];
}

export class CropRecommendationAI {
  private cropDatabase = [
    {
      id: 'rice',
      name: 'Rice',
      nameHindi: 'चावल',
      baseYield: 4.5,
      waterReq: 'high' as const,
      optimalPH: [5.5, 7.0],
      season: ['kharif'],
      marketPrice: 2500,
      image: '🌾',
      pros: ['High market demand', 'Government support', 'Food security crop'],
      cons: ['High water requirement', 'Methane emissions']
    },
    {
      id: 'wheat',
      name: 'Wheat',
      nameHindi: 'गेहूं',
      baseYield: 3.2,
      waterReq: 'medium' as const,
      optimalPH: [6.0, 7.5],
      season: ['rabi'],
      marketPrice: 2200,
      image: '🌾',
      pros: ['Stable market', 'Good storage life', 'Multiple uses'],
      cons: ['Price volatility', 'Pest susceptible']
    },
    {
      id: 'sugarcane',
      name: 'Sugarcane',
      nameHindi: 'गन्ना',
      baseYield: 70,
      waterReq: 'high' as const,
      optimalPH: [6.0, 8.0],
      season: ['kharif', 'rabi'],
      marketPrice: 350,
      image: '🎋',
      pros: ['High profit potential', 'Long harvest period', 'Industrial demand'],
      cons: ['High water need', 'Long growth cycle']
    },
    {
      id: 'cotton',
      name: 'Cotton',
      nameHindi: 'कपास',
      baseYield: 2.1,
      waterReq: 'medium' as const,
      optimalPH: [5.8, 8.0],
      season: ['kharif'],
      marketPrice: 6500,
      image: '🌱',
      pros: ['High value crop', 'Export potential', 'Textile industry demand'],
      cons: ['Pest issues', 'Market fluctuations']
    },
    {
      id: 'maize',
      name: 'Maize',
      nameHindi: 'मक्का',
      baseYield: 5.8,
      waterReq: 'medium' as const,
      optimalPH: [6.0, 7.5],
      season: ['kharif', 'rabi'],
      marketPrice: 1800,
      image: '🌽',
      pros: ['Versatile crop', 'Animal feed demand', 'Quick growth'],
      cons: ['Storage challenges', 'Weather sensitive']
    },
    {
      id: 'soybean',
      name: 'Soybean',
      nameHindi: 'सोयाबीन',
      baseYield: 2.3,
      waterReq: 'medium' as const,
      optimalPH: [6.0, 7.0],
      season: ['kharif'],
      marketPrice: 4200,
      image: '🫘',
      pros: ['Nitrogen fixation', 'Oil extraction', 'Protein rich'],
      cons: ['Market dependency', 'Processing required']
    }
  ];

  calculateSuitability(soil: SoilData, weather: WeatherData): CropRecommendation[] {
    return this.cropDatabase.map(crop => {
      // Simulate AI scoring algorithm
      let suitabilityScore = 0;
      
      // pH suitability (30% weight)
      const pHScore = this.calculatePHScore(soil.pH, crop.optimalPH);
      suitabilityScore += pHScore * 0.3;
      
      // Weather suitability (25% weight)
      const weatherScore = this.calculateWeatherScore(weather, crop);
      suitabilityScore += weatherScore * 0.25;
      
      // Soil nutrients (25% weight)
      const nutrientScore = this.calculateNutrientScore(soil);
      suitabilityScore += nutrientScore * 0.25;
      
      // Market factors (20% weight)
      const marketScore = Math.random() * 0.3 + 0.7; // Simulate market conditions
      suitabilityScore += marketScore * 0.2;
      
      // Calculate other metrics
      const expectedYield = crop.baseYield * suitabilityScore * (0.8 + Math.random() * 0.4);
      const profitMargin = this.calculateProfitMargin(expectedYield, crop.marketPrice);
      const sustainabilityScore = this.calculateSustainabilityScore(crop, soil);
      
      return {
        id: crop.id,
        name: crop.name,
        nameHindi: crop.nameHindi,
        suitabilityScore: Math.round(suitabilityScore * 100),
        expectedYield: Math.round(expectedYield * 10) / 10,
        profitMargin: Math.round(profitMargin),
        sustainabilityScore: Math.round(sustainabilityScore),
        waterRequirement: crop.waterReq,
        growthPeriod: this.getGrowthPeriod(crop.id),
        marketPrice: crop.marketPrice,
        image: crop.image,
        pros: crop.pros,
        cons: crop.cons
      };
    }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  private calculatePHScore(pH: number, optimalRange: number[]): number {
    const [min, max] = optimalRange;
    if (pH >= min && pH <= max) return 1.0;
    const distance = Math.min(Math.abs(pH - min), Math.abs(pH - max));
    return Math.max(0, 1 - distance / 2);
  }

  private calculateWeatherScore(weather: WeatherData, crop: Record<string, unknown>): number {
    // Simplified weather scoring
    let score = 0.7; // Base score
    
    if ((crop.season as string[]).includes(weather.season)) {
      score += 0.2;
    }
    
    // Temperature and humidity factors
    if (weather.temperature >= 20 && weather.temperature <= 35) {
      score += 0.1;
    }
    
    return Math.min(1.0, score);
  }

  private calculateNutrientScore(soil: SoilData): number {
    // Simplified nutrient scoring
    const nScore = Math.min(1, soil.nitrogen / 300);
    const pScore = Math.min(1, soil.phosphorus / 50);
    const kScore = Math.min(1, soil.potassium / 200);
    const omScore = Math.min(1, soil.organicMatter / 3);
    
    return (nScore + pScore + kScore + omScore) / 4;
  }

  private calculateProfitMargin(cropYield: number, pricePerTon: number): number {
    const revenue = cropYield * pricePerTon;
    const costs = cropYield * 800; // Estimated cost per ton
    return ((revenue - costs) / costs) * 100;
  }

  private calculateSustainabilityScore(crop: Record<string, unknown>, soil: SoilData): number {
    let score = 70; // Base sustainability score
    
    if (crop.waterReq === 'low') score += 15;
    else if (crop.waterReq === 'high') score -= 10;
    
    if (crop.id === 'soybean') score += 20; // Nitrogen fixation bonus
    if (soil.organicMatter > 2) score += 10;
    
    return Math.min(100, Math.max(0, score));
  }

  private getGrowthPeriod(cropId: string): number {
    const periods: { [key: string]: number } = {
      rice: 4,
      wheat: 5,
      sugarcane: 12,
      cotton: 6,
      maize: 3,
      soybean: 4
    };
    return periods[cropId] || 4;
  }

  // Mock weather API
  async getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      temperature: 25 + Math.random() * 15,
      humidity: 60 + Math.random() * 30,
      rainfall: Math.random() * 100,
      season: this.getCurrentSeason()
    };
  }

  private getCurrentSeason(): 'kharif' | 'rabi' | 'zaid' {
    const month = new Date().getMonth() + 1;
    if (month >= 6 && month <= 10) return 'kharif';
    if (month >= 11 || month <= 3) return 'rabi';
    return 'zaid';
  }

  // Mock market data
  getMarketData(): MarketData[] {
    return [
      { crop: 'Rice', price: 2500, demand: 'high', trend: 'rising' },
      { crop: 'Wheat', price: 2200, demand: 'medium', trend: 'stable' },
      { crop: 'Cotton', price: 6500, demand: 'high', trend: 'rising' },
      { crop: 'Sugarcane', price: 350, demand: 'medium', trend: 'falling' },
      { crop: 'Maize', price: 1800, demand: 'high', trend: 'stable' },
      { crop: 'Soybean', price: 4200, demand: 'medium', trend: 'rising' }
    ];
  }
}

export const aiModel = new CropRecommendationAI();