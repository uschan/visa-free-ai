export enum VisaStatus {
  VISA_FREE = 'VISA_FREE',
  VISA_ON_ARRIVAL = 'VISA_ON_ARRIVAL',
  ELECTRONIC_TRAVEL_AUTH = 'ETA', // e-Visa / ETA
  VISA_REQUIRED = 'VISA_REQUIRED',
}

export type Continent = 'Asia' | 'Europe' | 'Africa' | 'North America' | 'South America' | 'Oceania' | 'Antarctica';

export interface Airport {
  name: string;
  code: string; // IATA
  city: string;
  coordinates?: string;
}

export interface CountryMetadata {
  population: string;
  capital: string;
  currency: string;
  languages: string;
  visaFreeAccess?: number; // For source passport ranking
  region?: string;
  airports?: Airport[];
  timezone?: string;
  airQuality?: string;
}

export interface VisaRequirement {
  countryName: string;
  isoCode: string; // 3 letter code
  iso2Code?: string; // 2 letter code for flags
  status: VisaStatus;
  continent?: Continent;
  duration?: string; // e.g. "90 days"
  notes?: string;
  officialLink?: string;
  documentsRequired?: string[]; 
  lastUpdated?: string;
  metadata?: CountryMetadata; // Optional extra details
}

export interface Passport {
  code: string; // ISO 3 letter
  iso2: string; // ISO 2 letter for flags
  name: string;
  flagEmoji: string;
  metadata?: CountryMetadata; // Pre-filled metadata for popular ones
}

export interface ComparisonResult {
  countryName: string;
  isoCode: string;
  passportAStatus: VisaStatus;
  passportBStatus: VisaStatus;
}
