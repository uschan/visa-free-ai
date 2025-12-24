import { Passport, VisaStatus, VisaRequirement } from './types';

// Utility to get flag URL from FlagCDN
// size: w20, w40, w80, w160, w320, w640
export const getFlagUrl = (iso2?: string, size: 'w40' | 'w80' | 'w160' | 'w320' = 'w80') => {
  if (!iso2) return '';
  return `https://flagcdn.com/${size}/${iso2.toLowerCase()}.png`;
};

export const POPULAR_PASSPORTS: Passport[] = [
  // Asia
  { 
    code: 'SGP', iso2: 'SG', name: 'Singapore', flagEmoji: '🇸🇬',
    metadata: { population: '5.9M', capital: 'Singapore', visaFreeAccess: 194, currency: 'SGD', languages: 'English, Malay', region: 'Asia' }
  },
  { 
    code: 'JPN', iso2: 'JP', name: 'Japan', flagEmoji: '🇯🇵',
    metadata: { population: '125M', capital: 'Tokyo', visaFreeAccess: 192, currency: 'JPY', languages: 'Japanese', region: 'Asia' }
  },
  { 
    code: 'KOR', iso2: 'KR', name: 'South Korea', flagEmoji: '🇰🇷',
    metadata: { population: '51M', capital: 'Seoul', visaFreeAccess: 191, currency: 'KRW', languages: 'Korean', region: 'Asia' }
  },
  { 
    code: 'CHN', iso2: 'CN', name: 'China', flagEmoji: '🇨🇳',
    metadata: { population: '1.4B', capital: 'Beijing', visaFreeAccess: 85, currency: 'CNY', languages: 'Chinese', region: 'Asia' }
  },
  { 
    code: 'HKG', iso2: 'HK', name: 'Hong Kong', flagEmoji: '🇭🇰',
    metadata: { population: '7.4M', capital: 'Hong Kong', visaFreeAccess: 171, currency: 'HKD', languages: 'Chinese, English', region: 'Asia' }
  },
  { 
    code: 'IND', iso2: 'IN', name: 'India', flagEmoji: '🇮🇳',
    metadata: { population: '1.4B', capital: 'New Delhi', visaFreeAccess: 60, currency: 'INR', languages: 'Hindi, English', region: 'Asia' }
  },
  { 
    code: 'ARE', iso2: 'AE', name: 'United Arab Emirates', flagEmoji: '🇦🇪',
    metadata: { population: '9.4M', capital: 'Abu Dhabi', visaFreeAccess: 180, currency: 'AED', languages: 'Arabic', region: 'Asia' }
  },
  { 
    code: 'SAU', iso2: 'SA', name: 'Saudi Arabia', flagEmoji: '🇸🇦',
    metadata: { population: '35M', capital: 'Riyadh', visaFreeAccess: 88, currency: 'SAR', languages: 'Arabic', region: 'Asia' }
  },

  // Europe
  { 
    code: 'FRA', iso2: 'FR', name: 'France', flagEmoji: '🇫🇷',
    metadata: { population: '67M', capital: 'Paris', visaFreeAccess: 194, currency: 'EUR', languages: 'French', region: 'Europe' }
  },
  { 
    code: 'DEU', iso2: 'DE', name: 'Germany', flagEmoji: '🇩🇪',
    metadata: { population: '83M', capital: 'Berlin', visaFreeAccess: 194, currency: 'EUR', languages: 'German', region: 'Europe' }
  },
  { 
    code: 'ITA', iso2: 'IT', name: 'Italy', flagEmoji: '🇮🇹',
    metadata: { population: '59M', capital: 'Rome', visaFreeAccess: 194, currency: 'EUR', languages: 'Italian', region: 'Europe' }
  },
  { 
    code: 'ESP', iso2: 'ES', name: 'Spain', flagEmoji: '🇪🇸',
    metadata: { population: '47M', capital: 'Madrid', visaFreeAccess: 194, currency: 'EUR', languages: 'Spanish', region: 'Europe' }
  },
  { 
    code: 'GBR', iso2: 'GB', name: 'United Kingdom', flagEmoji: '🇬🇧',
    metadata: { population: '67M', capital: 'London', visaFreeAccess: 191, currency: 'GBP', languages: 'English', region: 'Europe' }
  },
  { 
    code: 'CHE', iso2: 'CH', name: 'Switzerland', flagEmoji: '🇨🇭',
    metadata: { population: '8.7M', capital: 'Bern', visaFreeAccess: 190, currency: 'CHF', languages: 'German, French', region: 'Europe' }
  },
  { 
    code: 'RUS', iso2: 'RU', name: 'Russia', flagEmoji: '🇷🇺',
    metadata: { population: '144M', capital: 'Moscow', visaFreeAccess: 115, currency: 'RUB', languages: 'Russian', region: 'Europe' }
  },

  // Americas
  { 
    code: 'USA', iso2: 'US', name: 'United States', flagEmoji: '🇺🇸',
    metadata: { population: '331M', capital: 'Washington, D.C.', visaFreeAccess: 188, currency: 'USD', languages: 'English', region: 'Americas' }
  },
  { 
    code: 'CAN', iso2: 'CA', name: 'Canada', flagEmoji: '🇨🇦',
    metadata: { population: '38M', capital: 'Ottawa', visaFreeAccess: 187, currency: 'CAD', languages: 'English, French', region: 'Americas' }
  },
  { 
    code: 'BRA', iso2: 'BR', name: 'Brazil', flagEmoji: '🇧🇷',
    metadata: { population: '214M', capital: 'Brasilia', visaFreeAccess: 173, currency: 'BRL', languages: 'Portuguese', region: 'Americas' }
  },
  { 
    code: 'ARG', iso2: 'AR', name: 'Argentina', flagEmoji: '🇦🇷',
    metadata: { population: '45M', capital: 'Buenos Aires', visaFreeAccess: 174, currency: 'ARS', languages: 'Spanish', region: 'Americas' }
  },
  { 
    code: 'MEX', iso2: 'MX', name: 'Mexico', flagEmoji: '🇲🇽',
    metadata: { population: '126M', capital: 'Mexico City', visaFreeAccess: 161, currency: 'MXN', languages: 'Spanish', region: 'Americas' }
  },

  // Oceania
  { 
    code: 'AUS', iso2: 'AU', name: 'Australia', flagEmoji: '🇦🇺',
    metadata: { population: '26M', capital: 'Canberra', visaFreeAccess: 189, currency: 'AUD', languages: 'English', region: 'Oceania' }
  },
  { 
    code: 'NZL', iso2: 'NZ', name: 'New Zealand', flagEmoji: '🇳🇿',
    metadata: { population: '5M', capital: 'Wellington', visaFreeAccess: 189, currency: 'NZD', languages: 'English', region: 'Oceania' }
  },

  // Africa
  { 
    code: 'ZAF', iso2: 'ZA', name: 'South Africa', flagEmoji: '🇿🇦',
    metadata: { population: '60M', capital: 'Pretoria', visaFreeAccess: 106, currency: 'ZAR', languages: 'English, Zulu', region: 'Africa' }
  },
];

export const STATUS_COLORS = {
  [VisaStatus.VISA_FREE]: 'bg-brand-900/30 text-brand-500 border-brand-800', // Dark mode green
  [VisaStatus.VISA_ON_ARRIVAL]: 'bg-blue-900/30 text-blue-500 border-blue-800',
  [VisaStatus.ELECTRONIC_TRAVEL_AUTH]: 'bg-amber-900/30 text-amber-500 border-amber-800',
  [VisaStatus.VISA_REQUIRED]: 'bg-red-900/30 text-red-500 border-red-800',
};

export const STATUS_LABELS = {
  [VisaStatus.VISA_FREE]: 'Visa Free',
  [VisaStatus.VISA_ON_ARRIVAL]: 'Visa On Arrival',
  [VisaStatus.ELECTRONIC_TRAVEL_AUTH]: 'E-Visa',
  [VisaStatus.VISA_REQUIRED]: 'Visa Required',
};

// Fallback data
export const MOCK_VISA_DATA: VisaRequirement[] = [
  { countryName: 'France', isoCode: 'FRA', iso2Code: 'FR', status: VisaStatus.VISA_FREE, duration: '90 days', continent: 'Europe' },
  { countryName: 'Thailand', isoCode: 'THA', iso2Code: 'TH', status: VisaStatus.VISA_FREE, duration: '30 days', continent: 'Asia' },
  { countryName: 'Turkey', isoCode: 'TUR', iso2Code: 'TR', status: VisaStatus.ELECTRONIC_TRAVEL_AUTH, duration: '90 days', officialLink: 'https://www.evisa.gov.tr', continent: 'Asia' },
  { countryName: 'Maldives', isoCode: 'MDV', iso2Code: 'MV', status: VisaStatus.VISA_ON_ARRIVAL, duration: '30 days', continent: 'Asia' },
  { countryName: 'Japan', isoCode: 'JPN', iso2Code: 'JP', status: VisaStatus.VISA_FREE, duration: '90 days', continent: 'Asia' },
];
