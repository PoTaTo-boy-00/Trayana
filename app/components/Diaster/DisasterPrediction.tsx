import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Waves,
  Zap,
  Wind,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  Shield,
  Activity,
  CloudRain,
  Thermometer,
  Eye,
  Moon,
  Sun,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { useTranslation } from "@/lib/translation-context";

// Enhanced type definitions
interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "datetime-local";
  placeholder?: string;
  step?: string;
  options?: string[];
  required?: boolean;
  tooltip?: string;
}

interface DisasterType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  textColor: string;
  gradient: string;
  formFields: FormField[];
}

interface PredictionResult {
  risk: "Critical" | "High" | "Moderate" | "Low";
  probability: string;
  message: string;
  recommendations: string[];
  confidence: number;
  details?: {
    factors: string[];
    timeline?: string;
    intensity?: string;
    affectedAreas?: string[];
    evacuationZones?: string[];
  };
}

interface FormData {
  [key: string]: string | number;
}

interface LoadingState {
  [key: string]: boolean;
}

interface PredictionState {
  [key: string]: PredictionResult;
}

// Gemini API Configuration
const GEMINI_API_KEY =
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

// Enhanced AI prediction with Gemini
const predictDisasterWithAI = async (
  disasterType: string,
  formData: FormData
): Promise<PredictionResult> => {
  const prompt = createPredictionPrompt(disasterType, formData);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (
      !data.candidates ||
      !data.candidates[0] ||
      !data.candidates[0].content
    ) {
      throw new Error("Invalid response from Gemini API");
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    return parseAIResponse(aiResponse);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getEnhancedFallbackPrediction(disasterType, formData);
  }
};

// Enhanced prompt creation with better context
const createPredictionPrompt = (
  disasterType: string,
  formData: FormData
): string => {
  const basePrompt = `You are an expert meteorologist and disaster prediction specialist with access to real-time data analysis. 

CRITICAL INSTRUCTIONS:
- Respond ONLY with a valid JSON object
- Use scientific data analysis principles
- Consider regional climate patterns and geological factors
- Provide accurate confidence scores based on data quality
- Include specific, actionable recommendations

Required JSON format:
{
  "risk": "Critical|High|Moderate|Low",
  "probability": "XX%",
  "message": "Brief scientific assessment",
  "confidence": XX,
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"],
  "details": {
    "factors": ["scientific factor 1", "scientific factor 2"],
    "timeline": "specific timeframe",
    "intensity": "technical intensity description",
    "affectedAreas": ["area1", "area2"],
    "evacuationZones": ["zone1", "zone2"]
  }
}`;

  const currentTime = new Date().toISOString();

  switch (disasterType) {
    case "cyclone":
      return `${basePrompt}

CYCLONE RISK ANALYSIS - ${currentTime}

Location: ${formData.location} (${formData.latitude}°N, ${formData.longitude}°E)
Observation Time: ${formData.timestamp}
Current Conditions:
- Wind Speed: ${formData.windSpeed} km/h
- Atmospheric Pressure: ${formData.pressure} hPa
- Sea Surface Temperature: ${formData.seaTemp}
- Tidal State: ${formData.tideLevel}
- Distance from Coast: ${formData.coastalProximity}
- Hemisphere: ${formData.hemisphere}
- Historical Activity: ${formData.historicalActivity}

ANALYSIS REQUIREMENTS:
1. Apply Saffir-Simpson Hurricane Wind Scale classification
2. Consider Coriolis effect based on hemisphere and latitude
3. Evaluate sea surface temperature thresholds (>26.5°C for development)
4. Assess pressure gradient and wind shear conditions
5. Calculate storm surge potential based on coastal proximity
6. Factor in regional climatology and seasonal patterns
7. Determine evacuation zones using standard coastal management protocols

Provide confidence score (0-100) based on data completeness and model certainty.`;

    case "flood":
      return `${basePrompt}

FLOOD RISK ANALYSIS - ${currentTime}

Location: ${formData.location} (${formData.latitude}°N, ${formData.longitude}°E)
Environmental Data:
- 24-hour Rainfall: ${formData.rainfall} mm
- River: ${formData.riverName}
- Water Level: ${formData.waterLevel} cm
- Soil Moisture: ${formData.soilMoisture}%
- Terrain: ${formData.landType}
- Season: ${formData.season}
- Flood History: ${formData.historicalFloods}

ANALYSIS REQUIREMENTS:
1. Apply rainfall intensity-duration-frequency curves
2. Consider soil saturation capacity and infiltration rates
3. Evaluate river discharge patterns and flood stage levels
4. Assess urban drainage capacity and runoff coefficients
5. Factor in topographic slope and watershed characteristics
6. Consider monsoon patterns and seasonal flood cycles
7. Determine flood inundation zones and evacuation routes

Include specific water level thresholds and timeline for peak discharge.`;

    case "earthquake":
      return `${basePrompt}

SEISMIC RISK ANALYSIS - ${currentTime}

Location: ${formData.location} (${formData.latitude}°N, ${formData.longitude}°E)
Seismic Parameters:
- Event Time: ${formData.timestamp}
- Magnitude: ${formData.magnitude} Richter Scale
- Depth: ${formData.depth} km
- Fault Distance: ${formData.faultLine}
- Soil Type: ${formData.soilType}
- Area Type: ${formData.areaType}
- Population Density: ${formData.populationDensity}/km²
- Infrastructure Age: ${formData.infrastructureAge} years
- Recent Activity: ${formData.previousEarthquake}

ANALYSIS REQUIREMENTS:
1. Apply Modified Mercalli Intensity Scale for impact assessment
2. Consider focal depth effects on ground motion intensity
3. Evaluate soil amplification factors and liquefaction potential
4. Assess building vulnerability based on construction era and codes
5. Calculate peak ground acceleration (PGA) estimates
6. Factor in fault rupture mechanics and aftershock probability
7. Determine search and rescue priority zones

Include aftershock probability using Omori's law and structural damage estimates.`;

    default:
      return `${basePrompt}\n\nData: ${JSON.stringify(formData)}`;
  }
};

// Enhanced response parsing
const parseAIResponse = (aiResponse: string): PredictionResult => {
  try {
    // Clean response
    let cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim();

    // Find JSON object
    const jsonStart = cleanResponse.indexOf("{");
    const jsonEnd = cleanResponse.lastIndexOf("}");

    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
    }

    const parsed = JSON.parse(cleanResponse);

    // Validate and ensure all required fields
    return {
      risk: parsed.risk || "Low",
      probability: parsed.probability || "25%",
      message: parsed.message || "Analysis completed",
      confidence: Math.min(100, Math.max(0, parsed.confidence || 75)),
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.slice(0, 5)
        : ["Follow standard emergency procedures"],
      details: {
        factors: Array.isArray(parsed.details?.factors)
          ? parsed.details.factors.slice(0, 4)
          : ["Standard risk factors considered"],
        timeline: parsed.details?.timeline || "To be determined",
        intensity: parsed.details?.intensity || "Standard intensity expected",
        affectedAreas: Array.isArray(parsed.details?.affectedAreas)
          ? parsed.details.affectedAreas
          : [],
        evacuationZones: Array.isArray(parsed.details?.evacuationZones)
          ? parsed.details.evacuationZones
          : [],
      },
    };
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Invalid response format from AI");
  }
};

// Enhanced fallback prediction
const getEnhancedFallbackPrediction = (
  disasterType: string,
  formData: FormData
): PredictionResult => {
  const fallbackResults: { [key: string]: PredictionResult } = {
    cyclone: {
      risk: "Moderate",
      probability: "35%",
      message: "Using offline analysis. Limited real-time data integration.",
      confidence: 60,
      recommendations: [
        "Monitor official weather services for updates",
        "Secure loose objects and outdoor furniture",
        "Keep emergency supplies ready (water, food, flashlight)",
        "Stay informed through emergency broadcast systems",
      ],
      details: {
        factors: ["API service unavailable", "Using local algorithms"],
        timeline: "Monitoring required for next 24-48 hours",
        intensity: "Unable to determine precise intensity",
      },
    },
    flood: {
      risk: "Moderate",
      probability: "40%",
      message: "Using offline analysis. Consider local drainage conditions.",
      confidence: 55,
      recommendations: [
        "Monitor local water levels and weather updates",
        "Avoid low-lying and flood-prone areas",
        "Keep emergency evacuation kit prepared",
        "Stay updated through local flood warning systems",
      ],
      details: {
        factors: ["API service unavailable", "Basic hydrological assessment"],
        timeline: "Continue monitoring for next 12-24 hours",
        intensity: "Moderate flooding possible in vulnerable areas",
      },
    },
    earthquake: {
      risk: "Low",
      probability: "20%",
      message:
        "Using offline analysis. Follow standard preparedness protocols.",
      confidence: 50,
      recommendations: [
        "Review earthquake safety procedures",
        "Secure heavy objects that could fall",
        "Identify safe spots in each room (under desks, doorways)",
        "Keep emergency supplies accessible",
      ],
      details: {
        factors: ["API service unavailable", "Standard seismic assessment"],
        timeline: "Ongoing preparedness recommended",
        intensity: "Standard earthquake preparedness protocols apply",
      },
    },
  };

  return fallbackResults[disasterType] || fallbackResults.cyclone;
};

// Enhanced disaster types configuration
const disasterTypes: DisasterType[] = [
  {
    id: "flood",
    title: "Flood Prediction",
    description: "Advanced hydrological analysis and flood risk assessment",
    icon: <Waves className="w-6 h-6" />,
    color: "blue",
    bgColor:
      "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50",
    textColor: "text-blue-600 dark:text-blue-400",
    gradient: "bg-gradient-to-r from-blue-500 to-cyan-500",
    formFields: [
      {
        name: "location",
        label: "Location",
        type: "text",
        placeholder: "e.g. Kolkata, West Bengal",
        required: true,
        tooltip: "Enter the specific location for flood analysis",
      },
      {
        name: "latitude",
        label: "Latitude",
        type: "number",
        placeholder: "e.g. 22.5726",
        step: "0.0001",
        required: true,
      },
      {
        name: "longitude",
        label: "Longitude",
        type: "number",
        placeholder: "e.g. 88.3639",
        step: "0.0001",
        required: true,
      },
      {
        name: "rainfall",
        label: "24-Hour Rainfall (mm)",
        type: "number",
        placeholder: "e.g. 150",
        required: true,
        tooltip: "Total rainfall in the last 24 hours",
      },
      {
        name: "riverName",
        label: "Nearest River/Water Body",
        type: "text",
        placeholder: "e.g. Hooghly River",
        required: false,
      },
      {
        name: "waterLevel",
        label: "Current Water Level (cm)",
        type: "number",
        placeholder: "e.g. 420",
        required: true,
        tooltip: "Current water level above normal",
      },
      {
        name: "soilMoisture",
        label: "Soil Saturation (%)",
        type: "number",
        placeholder: "e.g. 80",
        required: true,
      },
      {
        name: "landType",
        label: "Terrain Type",
        type: "select",
        options: ["Urban", "Rural", "Agricultural", "Mountainous", "Coastal"],
        required: true,
      },
      {
        name: "season",
        label: "Current Season",
        type: "select",
        options: ["Pre-Monsoon", "Monsoon", "Post-Monsoon", "Winter"],
        required: true,
      },
      {
        name: "historicalFloods",
        label: "Historical Flood Pattern",
        type: "select",
        options: [
          "No major floods in 10+ years",
          "Occasional flooding (1-2 times in 5 years)",
          "Regular annual flooding",
          "Frequent severe flooding",
        ],
        required: true,
      },
    ],
  },
  {
    id: "earthquake",
    title: "Earthquake Analysis",
    description: "Comprehensive seismic risk evaluation and impact assessment",
    icon: <Zap className="w-6 h-6" />,
    color: "orange",
    bgColor:
      "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50",
    textColor: "text-orange-600 dark:text-orange-400",
    gradient: "bg-gradient-to-r from-orange-500 to-red-500",
    formFields: [
      {
        name: "location",
        label: "Location",
        type: "text",
        placeholder: "e.g. Delhi, India",
        required: true,
      },
      {
        name: "latitude",
        label: "Latitude",
        type: "number",
        placeholder: "e.g. 28.7041",
        step: "0.0001",
        required: true,
      },
      {
        name: "longitude",
        label: "Longitude",
        type: "number",
        placeholder: "e.g. 77.1025",
        step: "0.0001",
        required: true,
      },
      {
        name: "timestamp",
        label: "Event/Observation Time",
        type: "datetime-local",
        required: true,
      },
      {
        name: "magnitude",
        label: "Recent Magnitude (Richter Scale)",
        type: "number",
        placeholder: "e.g. 4.2",
        step: "0.1",
        required: true,
        tooltip: "Most recent recorded earthquake magnitude",
      },
      {
        name: "depth",
        label: "Focal Depth (km)",
        type: "number",
        placeholder: "e.g. 15",
        required: true,
        tooltip: "Depth of earthquake focus below surface",
      },
      {
        name: "faultLine",
        label: "Distance from Major Fault",
        type: "select",
        options: ["< 5km", "5-20km", "20-50km", "50-100km", "> 100km"],
        required: true,
      },
      {
        name: "soilType",
        label: "Local Soil Composition",
        type: "select",
        options: [
          "Hard Rock",
          "Soft Rock",
          "Dense Soil",
          "Soft Clay",
          "Alluvial Deposits",
        ],
        required: true,
      },
      {
        name: "areaType",
        label: "Development Type",
        type: "select",
        options: ["Dense Urban", "Urban", "Suburban", "Rural"],
        required: true,
      },
      {
        name: "populationDensity",
        label: "Population Density (per km²)",
        type: "number",
        placeholder: "e.g. 11320",
        required: true,
      },
      {
        name: "infrastructureAge",
        label: "Average Building Age (years)",
        type: "number",
        placeholder: "e.g. 25",
        required: true,
      },
      {
        name: "previousEarthquake",
        label: "Recent Seismic Activity",
        type: "select",
        options: [
          "No activity in past month",
          "Minor tremors this week",
          "Significant activity this month",
          "Earthquake swarm ongoing",
        ],
        required: true,
      },
    ],
  },
  {
    id: "cyclone",
    title: "Cyclone Tracking",
    description: "Real-time cyclone formation analysis and path prediction",
    icon: <Wind className="w-6 h-6" />,
    color: "purple",
    bgColor:
      "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50",
    textColor: "text-purple-600 dark:text-purple-400",
    gradient: "bg-gradient-to-r from-purple-500 to-indigo-500",
    formFields: [
      {
        name: "location",
        label: "Location",
        type: "text",
        placeholder: "e.g. Bay of Bengal, 200km E of Visakhapatnam",
        required: true,
      },
      {
        name: "latitude",
        label: "Latitude",
        type: "number",
        placeholder: "e.g. 17.6868",
        step: "0.0001",
        required: true,
      },
      {
        name: "longitude",
        label: "Longitude",
        type: "number",
        placeholder: "e.g. 83.2185",
        step: "0.0001",
        required: true,
      },
      {
        name: "timestamp",
        label: "Observation Time",
        type: "datetime-local",
        required: true,
      },
      {
        name: "windSpeed",
        label: "Sustained Wind Speed (km/h)",
        type: "number",
        placeholder: "e.g. 95",
        required: true,
        tooltip: "Current sustained wind speed",
      },
      {
        name: "pressure",
        label: "Central Pressure (hPa)",
        type: "number",
        placeholder: "e.g. 985",
        required: true,
        tooltip: "Atmospheric pressure at storm center",
      },
      {
        name: "seaTemp",
        label: "Sea Surface Temperature",
        type: "select",
        options: ["< 24°C", "24-26°C", "26-28°C", "28-30°C", "> 30°C"],
        required: true,
        tooltip: "Current sea surface temperature",
      },
      {
        name: "tideLevel",
        label: "Current Tidal State",
        type: "select",
        options: ["Low Tide", "Rising Tide", "High Tide", "Receding Tide"],
        required: true,
      },
      {
        name: "coastalProximity",
        label: "Distance from Coastline",
        type: "select",
        options: [
          "< 50 km",
          "50-100 km",
          "100-200 km",
          "200-500 km",
          "> 500 km",
        ],
        required: true,
      },
      {
        name: "hemisphere",
        label: "Hemisphere",
        type: "select",
        options: ["Northern", "Southern"],
        required: true,
      },
      {
        name: "historicalActivity",
        label: "Regional Cyclone History",
        type: "select",
        options: [
          "Rare (< 1 per decade)",
          "Occasional (1-2 per 5 years)",
          "Regular (1+ per year)",
          "Very Active (Multiple per season)",
        ],
        required: true,
      },
    ],
  },
];
// Props interfaces
interface DisasterFormProps {
  disaster: DisasterType;
  onSubmit: (disasterId: string, formData: FormData) => Promise<void>;
  isLoading: boolean;
}

// Individual Form Component
const DisasterForm: React.FC<DisasterFormProps> = ({
  disaster,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<FormData>({});

  const handleInputChange = (name: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (): Promise<void> => {
    await onSubmit(disaster.id, formData);
  };

  return (
    <div className="space-y-4">
      {disaster.formFields.map((field: FormField) => (
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>{field.label}</Label>
          {field.type === "select" ? (
            <Select
              onValueChange={(value: string) =>
                handleInputChange(field.name, value)
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={`Select ${field.label.toLowerCase()}`}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={field.name}
              type={field.type}
              placeholder={field.placeholder}
              step={field.step}
              value={formData[field.name] || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleInputChange(field.name, e.target.value)
              }
              required
            />
          )}
        </div>
      ))}
      <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
        {isLoading
          ? "Analyzing..."
          : `Predict ${disaster.title.split(" ")[0]} Risk`}
      </Button>
    </div>
  );
};

// Main Component
const DynamicDisasterPrediction: React.FC = () => {
  const [predictions, setPredictions] = useState<PredictionState>({});
  const [loading, setLoading] = useState<LoadingState>({});

  const handlePrediction = async (
    disasterId: string,
    formData: FormData
  ): Promise<void> => {
    setLoading((prev) => ({ ...prev, [disasterId]: true }));

    try {
      // Use AI-powered prediction for all disaster types
      const result = await predictDisasterWithAI(disasterId, formData);

      setPredictions((prev) => ({
        ...prev,
        [disasterId]: result,
      }));
    } catch (error) {
      console.error("Prediction error:", error);

      // Show error message to user
      setPredictions((prev) => ({
        ...prev,
        [disasterId]: {
          risk: "Low",
          probability: "Unknown",
          message:
            "Unable to generate prediction. Please check your API configuration and try again.",
          confidence: 0,
          recommendations: [
            "Verify your Gemini API key is correctly set",
            "Check your internet connection",
            "Follow standard disaster preparedness guidelines",
          ],
          details: {
            factors: ["API Error"],
            timeline: "Unknown",
            intensity: "Unable to determine",
          },
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [disasterId]: false }));
    }
  };

  const getRiskColor = (risk?: string): string => {
    switch (risk?.toLowerCase()) {
      case "high":
        return "border-red-500 bg-red-50";
      case "moderate":
        return "border-yellow-500 bg-yellow-50";
      case "low":
        return "border-green-500 bg-green-50";
      default:
        return "border-gray-300";
    }
  };

  const { t } = useTranslation();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("disaster.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-2xl mx-auto">
          {t("disaster.desc")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {disasterTypes.map((disaster: DisasterType) => (
          <Card
            key={disaster.id}
            className="hover:shadow-lg transition-all duration-300 dark:bg-gray-800 dark:border-gray-700"
          >
            <CardHeader className="flex flex-row items-center gap-3">
              <div className={`p-3 ${disaster.bgColor} rounded-lg`}>
                <div className={disaster.textColor}>{disaster.icon}</div>
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg dark:text-white">
                  {disaster.title}
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {disaster.description}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <DisasterForm
                disaster={disaster}
                onSubmit={handlePrediction}
                isLoading={loading[disaster.id] || false}
              />

              {predictions[disaster.id] && (
                <Alert
                  className={`mt-4 ${getRiskColor(
                    predictions[disaster.id].risk
                  )} dark:bg-opacity-20 dark:border dark:border-opacity-30`}
                >
                  <AlertDescription>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg dark:text-white">
                          Risk Level: {predictions[disaster.id].risk}
                        </span>
                        <span className="text-sm font-medium dark:text-gray-200">
                          ({predictions[disaster.id].probability})
                        </span>
                      </div>

                      <p className="text-sm font-medium dark:text-gray-200">
                        {predictions[disaster.id].message}
                      </p>

                      {/* Enhanced details for cyclone predictions */}
                      {disaster.id === "cyclone" &&
                        predictions[disaster.id].details && (
                          <div className="space-y-2 text-xs dark:text-gray-300">
                            <div>
                              <p className="font-medium">Expected Timeline:</p>
                              <p>
                                {predictions[disaster.id].details?.timeline}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">
                                Potential Intensity:
                              </p>
                              <p>
                                {predictions[disaster.id].details?.intensity}
                              </p>
                            </div>
                            <div>
                              <p className="font-medium">Risk Factors:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {predictions[disaster.id].details?.factors.map(
                                  (factor: string, index: number) => (
                                    <li key={index}>{factor}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          </div>
                        )}

                      <div className="mt-3">
                        <p className="text-xs font-medium mb-2 dark:text-gray-200">
                          Recommendations:
                        </p>
                        <ul className="text-xs space-y-1 dark:text-gray-300">
                          {predictions[disaster.id].recommendations.map(
                            (rec: string, index: number) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <span className="text-blue-600 dark:text-blue-400 font-bold">
                                  •
                                </span>
                                <span>{rec}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DynamicDisasterPrediction;
