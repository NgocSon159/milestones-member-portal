import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface EarnMilesRequest {
  id: string;
  flightNumber: string;
  airline: string;
  from: string;
  to: string;
  departureDate: string;
  serviceClass: string;
  seatClass: string;
  distance: number;
  calculatedMiles: number; // This is qualifying miles for tier calculation
  bonusMiles: number; // This is bonus miles for redemption
  status: 'waiting to confirm' | 'approved' | 'rejected';
  submittedDate: string;
  processedDate?: string;
  reason?: string; // For rejection reason
}

interface EarnMilesContextType {
  requests: EarnMilesRequest[];
  addRequest: (request: Omit<EarnMilesRequest, 'id' | 'submittedDate'>) => void;
  hasRequestForFlight: (flightId: string) => boolean;
  getRequestForFlight: (flightId: string) => EarnMilesRequest | undefined;
  getRequestById: (requestId: string) => EarnMilesRequest | undefined;
}

const EarnMilesContext = createContext<EarnMilesContextType | undefined>(undefined);

// Mock some existing requests for demo with 10 additional approved requests
const initialRequests: EarnMilesRequest[] = [
  {
    id: 'req_001',
    flightNumber: 'VN789',
    airline: 'Vietnam Airlines',
    from: 'SGN - Ho Chi Minh City',
    to: 'HAN - Hanoi',
    departureDate: '2024-11-15',
    serviceClass: 'Business',
    seatClass: 'J',
    distance: 1166,
    calculatedMiles: 2565, // Qualifying miles
    bonusMiles: 3500, // Bonus miles (higher for business class)
    status: 'approved',
    submittedDate: '2024-11-16',
    processedDate: '2024-11-17'
  },
  {
    id: 'req_002',
    flightNumber: 'VN101',
    airline: 'Vietnam Airlines',
    from: 'HAN - Hanoi',
    to: 'SGN - Ho Chi Minh City',
    departureDate: '2024-11-18',
    serviceClass: 'Economy',
    seatClass: 'Y',
    distance: 1166,
    calculatedMiles: 1400, // Qualifying miles
    bonusMiles: 1400, // Bonus miles (same as economy)
    status: 'waiting to confirm',
    submittedDate: '2024-11-19'
  },
  {
    id: 'req_003',
    flightNumber: 'VN555',
    airline: 'Vietnam Airlines',
    from: 'SGN - Ho Chi Minh City',
    to: 'DAD - Da Nang',
    departureDate: '2024-10-10',
    serviceClass: 'Economy',
    seatClass: 'Q',
    distance: 608,
    calculatedMiles: 304, // Qualifying miles
    bonusMiles: 304, // Bonus miles
    status: 'rejected',
    submittedDate: '2024-10-11',
    processedDate: '2024-10-12',
    reason: 'Flight was cancelled, not eligible for miles credit'
  },
  // 10 additional approved requests
  {
    id: 'req_004',
    flightNumber: 'VN204',
    airline: 'Vietnam Airlines',
    from: 'HAN - Hanoi',
    to: 'BKK - Bangkok',
    departureDate: '2024-10-25',
    serviceClass: 'Business',
    seatClass: 'C',
    distance: 1245,
    calculatedMiles: 2867, // Qualifying miles
    bonusMiles: 4200, // Bonus miles (1.47x for business)
    status: 'approved',
    submittedDate: '2024-10-26',
    processedDate: '2024-10-27'
  },
  {
    id: 'req_005',
    flightNumber: 'VN356',
    airline: 'Vietnam Airlines',
    from: 'SGN - Ho Chi Minh City',
    to: 'SIN - Singapore',
    departureDate: '2024-10-20',
    serviceClass: 'Premium Economy',
    seatClass: 'W',
    distance: 1072,
    calculatedMiles: 1608, // Qualifying miles
    bonusMiles: 2100, // Bonus miles (1.3x for premium economy)
    status: 'approved',
    submittedDate: '2024-10-21',
    processedDate: '2024-10-22'
  },
  {
    id: 'req_006',
    flightNumber: 'VN162',
    airline: 'Vietnam Airlines',
    from: 'HAN - Hanoi',
    to: 'ICN - Seoul',
    departureDate: '2024-10-15',
    serviceClass: 'Economy',
    seatClass: 'Y',
    distance: 2273,
    calculatedMiles: 2273, // Qualifying miles
    bonusMiles: 2273, // Bonus miles (1x for economy)
    status: 'approved',
    submittedDate: '2024-10-16',
    processedDate: '2024-10-17'
  },
  {
    id: 'req_007',
    flightNumber: 'VN548',
    airline: 'Vietnam Airlines',
    from: 'SGN - Ho Chi Minh City',
    to: 'NRT - Tokyo',
    departureDate: '2024-10-12',
    serviceClass: 'Business',
    seatClass: 'J',
    distance: 2850,
    calculatedMiles: 4275, // Qualifying miles
    bonusMiles: 6200, // Bonus miles (1.45x for business)
    status: 'approved',
    submittedDate: '2024-10-13',
    processedDate: '2024-10-14'
  },
  {
    id: 'req_008',
    flightNumber: 'VN738',
    airline: 'Vietnam Airlines',
    from: 'HAN - Hanoi',
    to: 'KUL - Kuala Lumpur',
    departureDate: '2024-10-08',
    serviceClass: 'Economy',
    seatClass: 'H',
    distance: 1580,
    calculatedMiles: 1580, // Qualifying miles
    bonusMiles: 1580, // Bonus miles (1x for economy)
    status: 'approved',
    submittedDate: '2024-10-09',
    processedDate: '2024-10-10'
  },
  {
    id: 'req_009',
    flightNumber: 'VN454',
    airline: 'Vietnam Airlines',
    from: 'SGN - Ho Chi Minh City',
    to: 'PNH - Phnom Penh',
    departureDate: '2024-10-05',
    serviceClass: 'Premium Economy',
    seatClass: 'E',
    distance: 230,
    calculatedMiles: 287, // Qualifying miles
    bonusMiles: 380, // Bonus miles (1.32x for premium economy)
    status: 'approved',
    submittedDate: '2024-10-06',
    processedDate: '2024-10-07'
  },
  {
    id: 'req_010',
    flightNumber: 'VN612',
    airline: 'Vietnam Airlines',
    from: 'HAN - Hanoi',
    to: 'CDG - Paris',
    departureDate: '2024-09-28',
    serviceClass: 'Business',
    seatClass: 'D',
    distance: 8500,
    calculatedMiles: 12750, // Qualifying miles
    bonusMiles: 18500, // Bonus miles (1.45x for business)
    status: 'approved',
    submittedDate: '2024-09-29',
    processedDate: '2024-09-30'
  },
  {
    id: 'req_011',
    flightNumber: 'VN334',
    airline: 'Vietnam Airlines',
    from: 'SGN - Ho Chi Minh City',
    to: 'RGN - Yangon',
    departureDate: '2024-09-25',
    serviceClass: 'Economy',
    seatClass: 'V',
    distance: 615,
    calculatedMiles: 615, // Qualifying miles
    bonusMiles: 615, // Bonus miles (1x for economy)
    status: 'approved',
    submittedDate: '2024-09-26',
    processedDate: '2024-09-27'
  },
  {
    id: 'req_012',
    flightNumber: 'VN921',
    airline: 'Vietnam Airlines',
    from: 'HAN - Hanoi',
    to: 'SYD - Sydney',
    departureDate: '2024-09-20',
    serviceClass: 'Business',
    seatClass: 'I',
    distance: 7580,
    calculatedMiles: 11370, // Qualifying miles
    bonusMiles: 16500, // Bonus miles (1.45x for business)
    status: 'approved',
    submittedDate: '2024-09-21',
    processedDate: '2024-09-22'
  },
  {
    id: 'req_013',
    flightNumber: 'VN177',
    airline: 'Vietnam Airlines',
    from: 'SGN - Ho Chi Minh City',
    to: 'VTE - Vientiane',
    departureDate: '2024-09-15',
    serviceClass: 'Economy',
    seatClass: 'B',
    distance: 450,
    calculatedMiles: 450, // Qualifying miles
    bonusMiles: 450, // Bonus miles (1x for economy)
    status: 'approved',
    submittedDate: '2024-09-16',
    processedDate: '2024-09-17'
  },
  {
    id: 'req_014',
    flightNumber: 'VN666',
    airline: 'Vietnam Airlines',
    from: 'HAN - Hanoi',
    to: 'FRA - Frankfurt',
    departureDate: '2024-09-10',
    serviceClass: 'Premium Economy',
    seatClass: 'W',
    distance: 8820,
    calculatedMiles: 11025, // Qualifying miles
    bonusMiles: 14300, // Bonus miles (1.3x for premium economy)
    status: 'approved',
    submittedDate: '2024-09-11',
    processedDate: '2024-09-12'
  },
  {
    id: 'req_015',
    flightNumber: 'VN244',
    airline: 'Vietnam Airlines',
    from: 'SGN - Ho Chi Minh City',
    to: 'MNL - Manila',
    departureDate: '2024-09-05',
    serviceClass: 'Business',
    seatClass: 'O',
    distance: 1150,
    calculatedMiles: 2645, // Qualifying miles
    bonusMiles: 3800, // Bonus miles (1.44x for business)
    status: 'approved',
    submittedDate: '2024-09-06',
    processedDate: '2024-09-07'
  },
  {
    id: 'req_016',
    flightNumber: 'VN891',
    airline: 'Vietnam Airlines',
    from: 'HAN - Hanoi',
    to: 'JKT - Jakarta',
    departureDate: '2024-08-30',
    serviceClass: 'Economy',
    seatClass: 'M',
    distance: 1720,
    calculatedMiles: 1720, // Qualifying miles
    bonusMiles: 1720, // Bonus miles (1x for economy)
    status: 'approved',
    submittedDate: '2024-08-31',
    processedDate: '2024-09-01'
  }
];

export function EarnMilesProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<EarnMilesRequest[]>(initialRequests);

  const addRequest = (request: Omit<EarnMilesRequest, 'id' | 'submittedDate'>) => {
    const newRequest: EarnMilesRequest = {
      ...request,
      id: `req_${Date.now()}`,
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'waiting to confirm',
      // If bonusMiles not provided, calculate based on service class
      bonusMiles: request.bonusMiles || calculateBonusMiles(request.calculatedMiles, request.serviceClass)
    };
    setRequests(prev => [...prev, newRequest]);
  };

  // Helper function to calculate bonus miles based on service class
  const calculateBonusMiles = (qualifyingMiles: number, serviceClass: string): number => {
    switch (serviceClass.toLowerCase()) {
      case 'business':
        return Math.round(qualifyingMiles * 1.45);
      case 'premium economy':
        return Math.round(qualifyingMiles * 1.3);
      case 'economy':
      default:
        return qualifyingMiles;
    }
  };

  const hasRequestForFlight = (flightNumber: string) => {
    return requests.some(req => req.flightNumber === flightNumber);
  };

  const getRequestForFlight = (flightNumber: string) => {
    return requests.find(req => req.flightNumber === flightNumber);
  };

  const getRequestById = (requestId: string) => {
    return requests.find(req => req.id === requestId);
  };

  return (
    <EarnMilesContext.Provider value={{
      requests,
      addRequest,
      hasRequestForFlight,
      getRequestForFlight,
      getRequestById
    }}>
      {children}
    </EarnMilesContext.Provider>
  );
}

export function useEarnMiles() {
  const context = useContext(EarnMilesContext);
  if (context === undefined) {
    throw new Error('useEarnMiles must be used within an EarnMilesProvider');
  }
  return context;
}