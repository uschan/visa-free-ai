import { GoogleGenAI, Type } from "@google/genai";
import { VisaRequirement, VisaStatus, ComparisonResult, CountryMetadata } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const modelName = 'gemini-3-flash-preview';

/**
 * Fetches visa requirements list for a specific passport.
 * Optimized for Dashboard view.
 * 
 * NOTE ON ACCURACY:
 * We use a specialized prompt to ask the AI to categorize visa requirements accurately based on its training data.
 * For production accuracy, we should enable `googleSearch` tool, but mixing Search with JSON Schema output
 * can sometimes cause parsing errors if the model returns citations. 
 * For this list view (30+ items), we rely on the model's internal knowledge base for speed.
 */
export const fetchVisaRequirements = async (passportCode: string): Promise<VisaRequirement[]> => {
  if (!process.env.API_KEY) {
    return new Promise(resolve => setTimeout(() => resolve([]), 1000));
  }

  // Increased request count to 40 to provide more data
  const prompt = `
    I hold a passport from ${passportCode}.
    List 40 popular travel destinations (include mix of Asia, Europe, Americas, Oceania).
    Categorize them strictly into: VISA_FREE, VISA_ON_ARRIVAL, ETA (includes e-visa), or VISA_REQUIRED.
    
    CRITICAL INSTRUCTIONS: 
    1. Provide the ISO 3166-1 alpha-2 code (2 letters) as 'iso2Code' (e.g. JP, FR).
    2. Provide the ISO 3166-1 alpha-3 code (3 letters) as 'isoCode'.
    3. STATUS ACCURACY: Ensure the 'status' is accurate for 2024/2025. Verify if ETIAS or new e-visa rules apply.
    4. MIX: Ensure a good mix of visa-free and visa-required countries to show the passport's strength accurately.
    
    Return pure JSON array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // We do NOT use googleSearch here to ensure strict JSON array compliance for the large list.
        // Search grounding often adds citation text that breaks array parsing for large lists.
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              countryName: { type: Type.STRING },
              isoCode: { type: Type.STRING },
              iso2Code: { type: Type.STRING, description: "ISO 3166-1 alpha-2 code" },
              continent: { type: Type.STRING, enum: ['Asia', 'Europe', 'Africa', 'North America', 'South America', 'Oceania'] },
              status: { 
                type: Type.STRING, 
                enum: [
                  VisaStatus.VISA_FREE, 
                  VisaStatus.VISA_ON_ARRIVAL, 
                  VisaStatus.ELECTRONIC_TRAVEL_AUTH, 
                  VisaStatus.VISA_REQUIRED
                ] 
              },
            },
            required: ["countryName", "isoCode", "iso2Code", "status", "continent"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText) as VisaRequirement[];

  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};

/**
 * Fetches detailed visa info + Country Metadata for a single destination.
 * Matches Screenshot 3 (Airports, Stats, Requirements)
 * 
 * UPDATE: Enabled Google Search Grounding for high accuracy on details.
 */
export const fetchDestinationDetails = async (passportCode: string, destinationIso: string): Promise<VisaRequirement | null> => {
   if (!process.env.API_KEY) return null;

   const prompt = `
     Using Google Search, find the latest 2024/2025 visa requirements for ${passportCode} passport holders traveling to country with ISO code ${destinationIso}.
     
     Verify recent policy changes (e.g., visa waivers, new e-visa portals).
     
     Provide:
     1. Exact visa status (Visa Free, VoA, e-Visa, or Required).
     2. Official government e-visa/application website link (if applicable).
     3. Specific documents required.
     4. Destination metadata: Population, Capital, Currency, Timezone, Air Quality.
     
     Return the result as a strict JSON object matching the schema.
   `;

   try {
     const response = await ai.models.generateContent({
       model: 'gemini-3-pro-preview', // Use Pro for better reasoning with tools
       contents: prompt,
       config: {
         tools: [{ googleSearch: {} }], // Enable Search for accuracy
         responseMimeType: "application/json",
         responseSchema: {
           type: Type.OBJECT,
           properties: {
             countryName: { type: Type.STRING },
             isoCode: { type: Type.STRING },
             iso2Code: { type: Type.STRING },
             status: { type: Type.STRING, enum: Object.values(VisaStatus) },
             duration: { type: Type.STRING },
             notes: { type: Type.STRING },
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
                                name: { type: Type.STRING },
                                code: { type: Type.STRING },
                                city: { type: Type.STRING },
                                coordinates: { type: Type.STRING },
                            }
                        }
                    }
                }
             }
           },
           required: ["countryName", "status", "documentsRequired", "metadata", "iso2Code"]
         }
       }
     });

     if(!response.text) return null;
     // Clean up potential markdown formatting from search results
     const cleanJson = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
     return JSON.parse(cleanJson);
   } catch (error) {
     console.error("Gemini Detail API Error:", error);
     return null;
   }
}

export const comparePassportAccess = async (codeA: string, codeB: string): Promise<ComparisonResult[]> => {
    if (!process.env.API_KEY) return [];

    const prompt = `
      Compare visa access for Passport A (${codeA}) and Passport B (${codeB}) for 15 diverse countries.
      Ensure accuracy for 2024/2025 regulations.
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
                            passportAStatus: { type: Type.STRING, enum: Object.values(VisaStatus) },
                            passportBStatus: { type: Type.STRING, enum: Object.values(VisaStatus) },
                        },
                        required: ["countryName", "isoCode", "passportAStatus", "passportBStatus"]
                    }
                }
            }
        });
        
        const jsonText = response.text;
        if(!jsonText) return [];
        return JSON.parse(jsonText);
    } catch (e) {
        console.error(e);
        return [];
    }
}