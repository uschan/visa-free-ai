import { GoogleGenAI, Type } from "@google/genai";
import { VisaRequirement, VisaStatus, ComparisonResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
const modelName = 'gemini-3-flash-preview';

// --- CACHE UTILITIES ---
const CACHE_PREFIX = 'visa_ai_v2_';

const getCache = <T>(key: string): T | null => {
  try {
    const cached = sessionStorage.getItem(CACHE_PREFIX + key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      // Cache valid for 24 hours (static visa rules don't change often)
      if (Date.now() - timestamp < 24 * 60 * 60 * 1000) { 
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
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.warn("Cache write error (storage full?)", e);
  }
};

// --- JSON EXTRACTION UTILITIES ---
/**
 * Extracts the first valid JSON object from a potentially messy string.
 * Solves the issue of AI outputting analysis text mixed with JSON.
 */
const extractJSON = (text: string): any => {
  if (!text) return null;
  
  // 1. Try cleaning markdown code blocks first
  let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

  // 2. Try direct parse
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // 3. Fallback: Regex to find the outermost JSON object
    // This looks for the first '{' and the last '}'
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        console.error("Regex JSON parse failed:", e2);
      }
    }
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
    return new Promise(resolve => setTimeout(() => resolve([]), 1000));
  }

  const prompt = `
    I hold a passport from ${passportCode}.
    List 35 popular travel destinations (mix of Asia, Europe, Americas, Oceania).
    Categorize them strictly into: VISA_FREE, VISA_ON_ARRIVAL, ETA (includes e-visa), or VISA_REQUIRED.
    
    INSTRUCTIONS: 
    1. Output strictly a JSON Array. NO preamble. NO analysis text.
    2. Fields: countryName, isoCode (3-letter), iso2Code (2-letter), status, continent.
    3. Ensure 2024/2025 accuracy.
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
 * Fixes: Verbose output and Error handling.
 */
export const fetchDestinationDetails = async (passportCode: string, destinationIso: string): Promise<VisaRequirement | null> => {
   const cacheKey = `detail_${passportCode}_${destinationIso}`;
   const cachedData = getCache<VisaRequirement>(cacheKey);
   if (cachedData) return cachedData;

   if (!process.env.API_KEY) return null;

   // STRICT Prompt to prevent verbose text in metadata fields
   const prompt = `
     Search 2025 visa requirements for ${passportCode} passport to ${destinationIso}.
     
     Return valid JSON object ONLY. 
     IMPORTANT: Keep metadata strings SHORT (max 30 chars). Do NOT include long paragraphs in 'population' or 'timezone'.
     
     Data needed:
     1. Status (VISA_FREE, VISA_ON_ARRIVAL, ETA, VISA_REQUIRED)
     2. Official Link (if exists)
     3. Documents (List of strings)
     4. Metadata (Population, Capital, Currency, Timezone, Air Quality)
   `;

   try {
     const response = await ai.models.generateContent({
       model: 'gemini-3-pro-preview', // Pro is better for tools, but slower. 
       contents: prompt,
       config: {
         tools: [{ googleSearch: {} }],
         responseMimeType: "application/json",
         // We relax the schema slightly to avoid validation errors, but strictly enforce JSON in prompt
         responseSchema: {
           type: Type.OBJECT,
           properties: {
             countryName: { type: Type.STRING },
             isoCode: { type: Type.STRING },
             iso2Code: { type: Type.STRING },
             status: { type: Type.STRING, enum: Object.values(VisaStatus) },
             duration: { type: Type.STRING },
             officialLink: { type: Type.STRING },
             documentsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
             metadata: {
                type: Type.OBJECT,
                properties: {
                    population: { type: Type.STRING, description: "e.g. '67 Million'" },
                    capital: { type: Type.STRING },
                    currency: { type: Type.STRING },
                    timezone: { type: Type.STRING, description: "e.g. 'GMT+1'" },
                    airQuality: { type: Type.STRING, description: "Short index, e.g. 'Moderate (55 AQI)'" },
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
        // Post-processing sanity check
        if (!data.documentsRequired) data.documentsRequired = ["Passport"];
        setCache(cacheKey, data);
        return data;
     }
     
     return null;
   } catch (error) {
     console.error("Gemini Detail API Error:", error);
     return null;
   }
}

export const comparePassportAccess = async (codeA: string, codeB: string): Promise<ComparisonResult[]> => {
    // We don't cache comparison aggressively as users might change pairs often, 
    // but we could if needed. For now, keep it live.
    if (!process.env.API_KEY) return [];

    const prompt = `
      Compare visa access for ${codeA} vs ${codeB} for 15 diverse countries (include JP, GB, US, CN, AE, ZA, BR, FR).
      Return JSON Array.
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
        console.error(e);
        return [];
    }
}
