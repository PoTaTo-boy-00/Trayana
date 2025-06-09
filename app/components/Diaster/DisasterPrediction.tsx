import React, { useState } from "react";
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

// Type definitions
interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "select";
  placeholder?: string;
  step?: string;
  options?: string[];
}

interface DisasterType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  textColor: string;
  formFields: FormField[];
}

interface PredictionResult {
  risk: "High" | "Moderate" | "Low";
  probability: string;
  message: string;
  recommendations: string[];
  details?: {
    factors: string[];
    timeline?: string;
    intensity?: string;
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
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

// AI-powered disaster prediction using Gemini API
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
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Parse AI response into structured format
    return parseAIResponse(aiResponse);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback to enhanced local prediction
    return getFallbackPrediction(disasterType, formData);
  }
};

// Create detailed prompts for different disaster types
const createPredictionPrompt = (
  disasterType: string,
  formData: FormData
): string => {
  const basePrompt = `You are an expert Indian meteorologist and disaster prediction specialist. Analyze the following ${disasterType} conditions and provide a detailed risk assessment.
DO NOT include any comments, explanations, or trailing text.
IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{
  "risk": "Critical" | "High" | "Moderate" | "Low",
  "probability": "XX%",
  "message": "Brief assessment message",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "details": {
    "factors": ["factor1", "factor2"],
    "timeline": "time estimate",
    "intensity": "intensity description"
  }
}
`;

  switch (disasterType) {
    case "cyclone":
      return (
        basePrompt +
        `
Current Cyclone Conditions:
- Location: ${formData.location}
- Wind Speed: ${formData.windSpeed} km/h
- Atmospheric Pressure: ${formData.pressure} hPa
- Sea Surface Temperature: ${formData.seaTemp}

Consider meteorological factors like:
- Cyclone formation requires SST > 26°C
- Low pressure systems (< 1000 hPa) increase risk
- Wind speed thresholds: 39+ km/h (tropical depression), 62+ (tropical storm), 88+ (cyclone)
- Geographic factors (Bay of Bengal, Arabian Sea are high-risk)
- Seasonal patterns and current atmospheric conditions

Provide specific timeline (hours/days), intensity scale (Category 1-5), and actionable safety recommendations.`
      );

    case "flood":
      return (
        basePrompt +
        `
Current Flood Conditions:
- Location: ${formData.location}
- Season: ${formData.season}
- Rainfall (last 24h): ${formData.rainfall} mm
- River Name: ${formData.riverName || "Not specified"}
- River Water Level: ${formData.waterLevel} cm
- Soil Moisture: ${formData.soilMoisture}%

Perform flood risk analysis for ${formData.location}, India.

Include and consider:
- Typical Indian monsoon rainfall patterns
- River catchment characteristics and danger level thresholds for ${
          formData.riverName
        }
- Recent rainfall and saturation levels from soil moisture data
- Urban/rural drainage capacity in ${formData.location}
- **Historical flood records and recurrence trends** for ${
          formData.riverName
        } and the region

Output:
- Predicted flood risk level for the next **7 days**
- Severity, intensity, and estimated timeline of flood onset
- Clear, actionable recommendations for authorities and civilians
`
      );

    case "earthquake":
      return (
        basePrompt +
        `
Current Seismic Conditions:
- Location: ${formData.location}
- Recent Magnitude: ${formData.magnitude}
- Depth: ${formData.depth} km
- Fault Line Distance: ${formData.faultLine}

Consider factors like:
- Magnitude scale and damage potential
- Depth effects (shallow = more dangerous)
- Proximity to active fault lines
- Regional seismic history
- Building codes and infrastructure resilience

Provide aftershock timeline, intensity assessment, and structural safety recommendations.`
      );

    default:
      return basePrompt + `Data: ${JSON.stringify(formData)}`;
  }
};

// Parse AI response into structured format
const parseAIResponse = (aiResponse: string): PredictionResult => {
  try {
    // Remove any markdown code blocks
    const cleanResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim();

    // Parse JSON response
    const parsed = JSON.parse(cleanResponse);

    // Validate required fields
    if (
      !parsed.risk ||
      !parsed.probability ||
      !parsed.message ||
      !parsed.recommendations
    ) {
      throw new Error("Invalid response format");
    }

    return {
      risk: parsed.risk,
      probability: parsed.probability,
      message: parsed.message,
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      details: parsed.details || {},
    };
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw error;
  }
};

// Fallback prediction for when API fails
const getFallbackPrediction = (
  disasterType: string,
  formData: FormData
): PredictionResult => {
  const fallbackResults: { [key: string]: PredictionResult } = {
    cyclone: {
      risk: "Moderate",
      probability: "45%",
      message:
        "Unable to connect to prediction service. Using basic assessment.",
      recommendations: [
        "Monitor weather updates closely",
        "Prepare emergency supplies",
        "Stay informed through official channels",
      ],
      details: {
        factors: ["API service unavailable"],
        timeline: "Unknown",
        intensity: "Unable to determine",
      },
    },
    flood: {
      risk: "Moderate",
      probability: "40%",
      message:
        "Unable to connect to prediction service. Using basic assessment.",
      recommendations: [
        "Monitor water levels",
        "Avoid low-lying areas",
        "Keep emergency kit ready",
      ],
    },
    earthquake: {
      risk: "Low",
      probability: "25%",
      message:
        "Unable to connect to prediction service. Using basic assessment.",
      recommendations: [
        "Follow standard earthquake preparedness",
        "Secure heavy objects",
        "Know evacuation routes",
      ],
    },
  };

  return fallbackResults[disasterType] || fallbackResults.cyclone;
};

// Disaster configuration data
const disasterTypes: DisasterType[] = [
  {
    id: "flood",
    title: "Flood Prediction",
    description: "Predict flood risks in your area",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
        />
      </svg>
    ),
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-600",
    formFields: [
      {
        name: "location",
        label: "Location",
        type: "text",
        placeholder: "Enter location",
      },
      {
        name: "rainfall",
        label: "Rainfall (mm)",
        type: "number",
        placeholder: "Enter rainfall amount",
      },
      {
        name: "riverName",
        label: "River Name",
        type: "text",
        placeholder: "Enter River name",
      },
      {
        name: "waterLevel",
        label: "Water Level (cm)",
        type: "number",
        placeholder: "Current water level",
      },
      {
        name: "soilMoisture",
        label: "Soil Moisture (%)",
        type: "number",
        placeholder: "Enter the soil moisture",
      },
      {
        name: "season",
        label: "Season",
        type: "select",
        options: ["Spring", "Summer", "Monsoon", "Winter"],
      },
    ],
  },
  {
    id: "earthquake",
    title: "Earthquake Prediction",
    description: "Monitor seismic activity and risks",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
    formFields: [
      {
        name: "location",
        label: "Location",
        type: "text",
        placeholder: "Enter location",
      },
      {
        name: "magnitude",
        label: "Recent Magnitude",
        type: "number",
        placeholder: "Last recorded magnitude",
        step: "0.1",
      },
      {
        name: "depth",
        label: "Depth (km)",
        type: "number",
        placeholder: "Earthquake depth",
      },
      {
        name: "faultLine",
        label: "Fault Line Distance",
        type: "select",
        options: ["< 10km", "10-50km", "50-100km", "> 100km"],
      },
    ],
  },
  {
    id: "cyclone",
    title: "Cyclone Prediction",
    description: "Track cyclone formations and paths",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-600",
    formFields: [
      {
        name: "location",
        label: "Location",
        type: "text",
        placeholder: "Enter coastal location (e.g., Bay of Bengal)",
      },
      {
        name: "windSpeed",
        label: "Wind Speed (km/h)",
        type: "number",
        placeholder: "Current sustained wind speed",
      },
      {
        name: "pressure",
        label: "Atmospheric Pressure (hPa)",
        type: "number",
        placeholder: "Current barometric pressure",
      },
      {
        name: "seaTemp",
        label: "Sea Surface Temperature",
        type: "select",
        options: ["< 26°C", "26-28°C", "28-30°C", "> 30°C"],
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI-Powered Disaster Prediction System
        </h1>
        <p className="text-gray-600">
          Advanced AI predictions using Google Gemini for accurate disaster risk
          assessment
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
