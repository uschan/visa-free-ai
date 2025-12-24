import { GoogleGenAI, Type } from "@google/genai";
import { VisaRequirement, VisaStatus, ComparisonResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const modelName = 'gemini-3-flash-preview';

// --- CACHE UTILITIES ---
const CACHE_PREFIX = 'visa_ai_v4_'; // Bump version to invalidate old cache

const getCache = <T>(key: string): T | null => {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Valid for 7 days
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
    try {
        localStorage.clear();
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch(e2) {}
  }
};

// --- JSON EXTRACTION UTILITIES ---
const extractJSON = (text: string): any => {
  if (!text) return null;
  
  // 1. Try markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
     try { return JSON.parse(codeBlockMatch[1]); } catch(e) {}
  }

  // 2. Try raw JSON via bracket matching
  const firstOpen = text.indexOf('{');
  const lastClose = text.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
      const candidate = text.substring(firstOpen, lastClose + 1);
      try { return JSON.parse(candidate); } catch(e) {}
  }

  // 3. Simple Clean
  try {
    const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON Parse Failed");
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

  if (!process.env.API_KEY) return [];

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
 * FIX: Switched to 'gemini-3-flash-preview' and removed 'tools' to prevent 400 Bad Request errors.
 */
export const fetchDestinationDetails = async (passportCode: string, destinationIso: string): Promise<VisaRequirement | null> => {
   const cacheKey = `detail_${passportCode}_${destinationIso}`;
   const cachedData = getCache<VisaRequirement>(cacheKey);
   if (cachedData) return cachedData;

   if (!process.env.API_KEY) {
       console.error("API_KEY missing");
       return null;
   }

   const prompt = `
     Analyze 2025 visa rules: ${passportCode} holder visiting ${destinationIso}.
     
     CONSTRAINTS:
     1. Metadata strings MUST be SHORT (max 30 chars).
        - Bad: "UTC+07:00 (Indochina Time...)"
        - Good: "UTC+07:00"
     2. Strict JSON output.

     Return JSON Object:
     {
       "countryName": string,
       "isoCode": string,
       "iso2Code": string,
       "status": "VISA_FREE" | "VISA_ON_ARRIVAL" | "ETA" | "VISA_REQUIRED",
       "documentsRequired": string[],
       "officialLink": string | null,
       "metadata": {
         "population": string,
         "capital": string,
         "currency": string,
         "timezone": string,
         "airQuality": string,
         "airports": [{"code": string, "city": string}]
       }
     }
   `;

   try {
     // Using Flash model without tools is the safest, most stable method.
     // It avoids regional restrictions or tool-configuration errors.
     const response = await ai.models.generateContent({
       model: 'gemini-3-flash-preview', 
       contents: prompt,
       config: {
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
        // Enforce strict length limits manually in case AI ignores prompt
        if (data.metadata) {
            ['timezone', 'population', 'airQuality'].forEach(key => {
                if (data.metadata[key] && data.metadata[key].length > 30) {
                    data.metadata[key] = data.metadata[key].substring(0, 30);
                }
            });
        }
        setCache(cacheKey, data);
        return data;
     }
     
     return null;
   } catch (error) {
     console.error("Gemini Detail API Error:", error);
     throw error;
   }
}

export const comparePassportAccess = async (codeA: string, codeB: string): Promise<ComparisonResult[]> => {
    if (!process.env.API_KEY) return [];

    const prompt = `
      Compare visa access: ${codeA} vs ${codeB}.
      15 diverse countries.
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