Weather Dashboard App - MVP Implementation
Core Files to Create/Modify:
src/App.tsx - Main app with routing and authentication state
src/components/LoginPage.tsx - Login form with geolocation detection
src/components/WeatherDashboard.tsx - Main weather dashboard
src/components/WeatherCard.tsx - Current weather display card
src/components/ForecastCard.tsx - 7-day forecast component
src/components/LocationInput.tsx - Manual location input fallback
src/utils/weatherApi.ts - Weather API integration utilities
src/utils/geolocation.ts - Geolocation utilities
Key Features:
Login system with automatic geolocation
Weather API integration (configurable API key)
7-day forecast with weather icons
Responsive card-based UI
Local storage for location persistence
Manual location input fallback
Weather alerts and conditions
Tech Stack:
React + TypeScript
Tailwind CSS
Lucide React (for icons)
Browser Geolocation API
WeatherAPI.com (free tier)