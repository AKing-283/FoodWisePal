
import { useState } from 'react';

export interface FoodBank {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  website: string | null;
  acceptsPerishable: boolean;
  distance: number; // miles
  latitude: number;
  longitude: number;
}

// Mock food bank data
const MOCK_FOOD_BANKS: FoodBank[] = [
  {
    id: '1',
    name: 'City Food Bank',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    phone: '(415) 555-1234',
    website: 'https://cityfoodbank.org',
    acceptsPerishable: true,
    distance: 1.2,
    latitude: 37.7749,
    longitude: -122.4194
  },
  {
    id: '2',
    name: 'Community Pantry',
    address: '456 Market St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    phone: '(415) 555-5678',
    website: 'https://communitypantry.org',
    acceptsPerishable: false,
    distance: 2.5,
    latitude: 37.7815,
    longitude: -122.4256
  },
  {
    id: '3',
    name: 'Neighborhood Food Assistance',
    address: '789 Mission St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    phone: '(415) 555-9012',
    website: null,
    acceptsPerishable: true,
    distance: 3.1,
    latitude: 37.7855,
    longitude: -122.4071
  },
  {
    id: '4',
    name: 'Bay Area Hunger Relief',
    address: '101 Howard St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    phone: '(415) 555-3456',
    website: 'https://bayareahunger.org',
    acceptsPerishable: true,
    distance: 4.3,
    latitude: 37.7929,
    longitude: -122.3971
  },
  {
    id: '5',
    name: 'Sunset District Food Center',
    address: '2500 Irving St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94122',
    phone: '(415) 555-7890',
    website: 'https://sunsetfood.org',
    acceptsPerishable: false,
    distance: 5.8,
    latitude: 37.7639,
    longitude: -122.4916
  }
];

export const useFoodBanks = () => {
  const [foodBanks, setFoodBanks] = useState<FoodBank[]>(MOCK_FOOD_BANKS);
  const [loading, setLoading] = useState(false);

  // Mock function to find nearby food banks
  // In a real app, this would use the Google Maps API with the user's location
  const findNearbyFoodBanks = async (zipCode: string) => {
    try {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter food banks based on zip code
      // In this mock version, we'll return a modified version of our static data
      const filtered = MOCK_FOOD_BANKS.map(bank => ({
        ...bank,
        // Randomize the distance a bit to simulate different locations
        distance: Math.round((bank.distance + (Math.random() * 2 - 1)) * 10) / 10
      }));
      
      // Sort by distance
      filtered.sort((a, b) => a.distance - b.distance);
      
      setFoodBanks(filtered);
      return filtered;
    } catch (error) {
      console.error('Error finding nearby food banks:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    foodBanks,
    loading,
    findNearbyFoodBanks
  };
};
