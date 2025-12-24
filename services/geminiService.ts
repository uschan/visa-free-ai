import { GoogleGenAI, Type } from "@google/genai";
import { VisaRequirement, VisaStatus, ComparisonResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const modelName = 'gemini-3-flash-preview';

// --- CACHE UTILITIES ---
const CACHE_PREFIX = 'visa_ai_v3_'; // Bump version to clear old cache

const getCache = <T>(key: string): T | null => {
  try {
    // Switch to localStorage for persistence across sessions/refreshes
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache valid for 7 days (Visa rules are stable)
      if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) { 
        return data as T;
      }
    }
  } catch (e) {
    console.warn("Cache read error", e);
  }
  return null;
};

const setCache = (key: string, data: any) => {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    // If storage full, try clearing old entries (simple strategy: clear all)
    try {
        localStorage.clear();
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch(e2) {
        console.warn("Cache write failed", e2);
    }
  }
};

// --- JSON EXTRACTION UTILITIES ---
const extractJSON = (text: string): any => {
  if (!text) return null;
  
  // 1. Try finding a markdown code block first (Most reliable)
  // Matches ```json { ... } ``` including newlines
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
     try { return JSON.parse(codeBlockMatch[1]); } catch(e) {}
  }

  // 2. Fallback: Find the first '{' and the last '}' to isolate the object
  const firstOpen = text.indexOf('{');
  const lastClose = text.lastIndexOf('}');
  
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
      const candidate = text.substring(firstOpen, lastClose + 1);
      try { return JSON.parse(candidate); } catch(e) {}
  }

  // 3. Last Resort: Simple cleanup
  try {
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Extraction Failed", e);
  }
  return null;
};

/**
 * Fetches visa requirements list for a specific passport.
 */
export const fetchVisaRequirements = async (passportCode: string): Promise<VisaRequirement[]> => {
  const cacheKey = `list_${passportCode}`;
  const cachedData = getCache<VisaRequirement[]>(cacheKey);
  if (cachedData) return cachedData;

  if (!process.env.API_KEY) {
    // Return mock data or empty if no key, to prevent crash
    return [];
  }

  const prompt = `
    Passport: ${passportCode}.
    List 35 popular destinations (Asia, Europe, Americas, Oceania).
    Categorize: VISA_FREE, VISA_ON_ARRIVAL, ETA, or VISA_REQUIRED.
    
    Output strictly a JSON Array.
    Fields: countryName, isoCode (3-letter), iso2Code (2-letter), status, continent.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              countryName: { type: Type.STRING },
              isoCode: { type: Type.STRING },
              iso2Code: { type: Type.STRING },
              continent: { type: Type.STRING },
              status: { 
                type: Type.STRING, 
                enum: [VisaStatus.VISA_FREE, VisaStatus.VISA_ON_ARRIVAL, VisaStatus.ELECTRONIC_TRAVEL_AUTH, VisaStatus.VISA_REQUIRED] 
              },
            },
            required: ["countryName", "isoCode", "status"]
          }
        }
      }
    });

    const data = extractJSON(response.text) as VisaRequirement[];
    if (data && Array.isArray(data)) {
      setCache(cacheKey, data);
      return data;
    }
    return [];
  } catch (error) {
    console.error("Gemini List API Error:", error);
    return [];
  }
};

/**
 * Fetches detailed visa info.
 */
export const fetchDestinationDetails = async (passportCode: string, destinationIso: string): Promise<VisaRequirement | null> => {
   const cacheKey = `detail_${passportCode}_${destinationIso}`;
   const cachedData = getCache<VisaRequirement>(cacheKey);
   if (cachedData) return cachedData;

   if (!process.env.API_KEY) {
       console.error("API_KEY is missing via process.env.API_KEY");
       return null;
   }

   // STRICT Prompt to prevent verbose text in metadata fields
   const prompt = `
     Analyze 2025 visa rules: ${passportCode} -> ${destinationIso}.
     
     STRICT CONSTRAINT: Metadata strings must be SHORT (max 30 chars).
     - Bad: "UTC+07:00 (Indochina Time, Asia/Bangkok, no DST...)"
     - Good: "UTC+07:00"
     - Bad: "66 million (2024 estimate by World Bank...)"
     - Good: "66 Million"

     Return strictly JSON.
     1. Status (VISA_FREE, VISA_ON_ARRIVAL, ETA, VISA_REQUIRED)
     2. Documents (Array of strings)
     3. Metadata (Population, Capital, Currency, Timezone, Air Quality)
   `;

   try {
     const response = await ai.models.generateContent({
       model: 'gemini-3-pro-preview', 
       contents: prompt,
       config: {
         tools: [{ googleSearch: {} }],
         responseMimeType: "application/json",
         responseSchema: {
           type: Type.OBJECT,
           properties: {
             countryName: { type: Type.STRING },
             isoCode: { type: Type.STRING },
             iso2Code: { type: Type.STRING },
             status: { type: Type.STRING, enum: Object.values(VisaStatus) },
             officialLink: { type: Type.STRING },
             documentsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
             metadata: {
                type: Type.OBJECT,
                properties: {
                    population: { type: Type.STRING },
                    capital: { type: Type.STRING },
                    currency: { type: Type.STRING },
                    timezone: { type: Type.STRING },
                    airQuality: { type: Type.STRING },
                    airports: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                code: { type: Type.STRING },
                                city: { type: Type.STRING },
                            }
                        }
                    }
                }
             }
           },
           required: ["status", "metadata"]
         }
       }
     });

     const data = extractJSON(response.text);
     
     if (data) {
        // Sanity Check: Truncate fields if AI ignored instructions
        if (data.metadata) {
            if (data.metadata.timezone && data.metadata.timezone.length > 30) {
                data.metadata.timezone = data.metadata.timezone.split('(')[0].trim().substring(0, 30);
            }
            if (data.metadata.population && data.metadata.population.length > 20) {
                data.metadata.population = data.metadata.population.substring(0, 20);
            }
        }

        setCache(cacheKey, data);
        return data;
     }
     
     return null;
   } catch (error) {
     console.error("Gemini Detail API Error:", error);
     throw error; // Throw so UI can see it's an API/Network error
   }
}

export const comparePassportAccess = async (codeA: string, codeB: string): Promise<ComparisonResult[]> => {
    if (!process.env.API_KEY) return [];

    const prompt = `
      Compare visa access: ${codeA} vs ${codeB}.
      15 destinations (JP, GB, US, CN, AE, ZA, BR, FR + others).
      JSON Array Only.
    `;

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            countryName: { type: Type.STRING },
                            passportAStatus: { type: Type.STRING, enum: Object.values(VisaStatus) },
                            passportBStatus: { type: Type.STRING, enum: Object.values(VisaStatus) },
                        },
                        required: ["countryName", "passportAStatus", "passportBStatus"]
                    }
                }
            }
        });
        return extractJSON(response.text) || [];
    } catch (e) {
        return [];
    }
}