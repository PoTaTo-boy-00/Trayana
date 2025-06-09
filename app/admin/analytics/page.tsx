"use client";

import { useEffect, useState, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";
import { BarChart, PieChart } from "@/app/components/charts";
import PredictionTimeline from "@/app/components/predictiveTimeline";
// import PredictionTimeline from "@/app/components/charts/PredictionTimeline";

interface ResourceHistory {
  id: string;
  resource_id: string;
  quantity: number;
  timestamp: string;
}

interface PredictionData {
  hour: number;
  resources: {
    [key: string]: {
      remaining: number;
      trend: "increasing" | "decreasing" | "stable";
      velocity: number;
    };
  };
}
interface ImmediateNeed {
  name: string;
  type: string;
  quantity: number | string;
  reason: string;
  location: string;
}

interface EnhancedDepletionPrediction {
  type: string;
  currentAmount: number;
  depletionTime: string;
  depletionProbability: number;
  trend: string;
  velocity: number;
  confidence: number;
}

interface GapAnalysisItem {
  type: string;
  quantityNeeded?: number;
  quantity?: number;
  trend?: string;
  predictedNeed?: number;
  timeframe?: string;
}

interface GapAnalysis {
  missingTypes: GapAnalysisItem[];
  immediateNeeds: ImmediateNeed[];
  surplusResources: GapAnalysisItem[];
  emergingNeeds?: GapAnalysisItem[];
}
const AnalyticsPage = () => {
  const [requestedResources, setRequestedResources] = useState<any[]>([]);
  const [availableResources, setAvailableResources] = useState<any[]>([]);
  const [resourceHistory, setResourceHistory] = useState<ResourceHistory[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<{
    immediateNeeds: ImmediateNeed[];
    missingTypes: any[];
    surplusResources: any[];
    emergingNeeds: any[];
  }>({
    immediateNeeds: [],
    missingTypes: [],
    surplusResources: [],
    emergingNeeds: [],
  });

  const [priorityScores, setPriorityScores] = useState<{
    [key: string]: number;
  }>({});

  const [depletionPredictions, setDepletionPredictions] = useState<
    EnhancedDepletionPrediction[]
  >([]);
  const [predictionTimeline, setPredictionTimeline] = useState<
    PredictionData[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
  );

  // Fetch data from Supabase with history
  const fetchData = async () => {
    try {
      const { data: requested, error: reqError } = await supabase
        .from("requestresources")
        .select("*");

      const { data: available, error: availError } = await supabase
        .from("resources")
        .select("*");

      const { data: history, error: historyError } = await supabase
        .from("resource_history")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(1000); // Get last 1000 history records

      if (reqError || availError || historyError) {
        throw reqError || availError || historyError;
      }

      setRequestedResources(requested || []);
      setAvailableResources(available || []);
      setResourceHistory(history || []);
      setLastUpdate(new Date());

      return { requested, available, history };
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to fetch data from database");
      return { requested: [], available: [], history: [] };
    }
  };

  // Setup real-time subscriptions
  const setupRealTimeSubscriptions = useCallback(() => {
    const resourcesSubscription = supabase
      .channel("resources-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "resources",
        },
        (payload) => {
          console.log("Resource change detected:", payload);
          fetchData().then(() => analyzeDataWithHistory());
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "requestresources",
        },
        (payload) => {
          console.log("Request change detected:", payload);
          fetchData().then(() => analyzeDataWithHistory());
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setIsRealTimeConnected(true);
          console.log("Real-time subscription active");
        } else if (status === "CLOSED") {
          setIsRealTimeConnected(false);
          console.log("Real-time subscription closed");
        }
      });

    return () => {
      resourcesSubscription.unsubscribe();
      setIsRealTimeConnected(false);
    };
  }, []);

  // Helper function to parse Gemini response
  const parseGeminiResponse = (text: string) => {
    try {
      let cleanedText = text;

      // Remove markdown code fences if present
      const codeBlockMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/i);
      if (codeBlockMatch) {
        cleanedText = codeBlockMatch[1];
      }

      // Strip JavaScript-style comments (// or /* */)
      cleanedText = cleanedText
        .replace(/\/\/.*$/gm, "") // Remove inline comments
        .replace(/\/\*[\s\S]*?\*\//gm, ""); // Remove block comments

      return JSON.parse(cleanedText.trim());
    } catch (e) {
      console.error("Failed to parse response:", text);
      throw new Error("Invalid JSON response from AI model");
    }
  };

  // Enhanced analysis with historical data and predictions
  const analyzeDataWithHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { requested, available, history } = await fetchData();
      if (!requested || !available) return;

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
      });

      // 1. Enhanced Priority Scoring with trend analysis
      const priorityPrompt = `
        Analyze disaster resource requests with historical context. Calculate priority scores (1-10) using:
      - Request urgency and severity
      - Historical trend patterns
      - Resource depletion velocity
      - Population impact metrics
      
      Use EXACT location names do not use Coordinates from requests as JSON keys. Output ONLY valid JSON:
      { "Actual Location Name 1": score, "Actual Location Name 2": score }
      
      Current Requests: ${JSON.stringify(requested.slice(0, 50))}
      Historical Data: ${JSON.stringify(history.slice(0, 100))}

      - DO NOT include any comments, explanations, or trailing text. Only pure JSON.
      `;

      const priorityResult = await model.generateContent(priorityPrompt);
      const priorityText = await priorityResult.response.text();
      4;
      console.log("Protiy Test: ", priorityText);
      setPriorityScores(parseGeminiResponse(priorityText));

      // 2. Enhanced Gap Analysis with predictive elements
      const gapPrompt = `
        Perform gap analysis with predictive insights. Follow these rules:
      - "missingTypes": Only items NOT in available resources OR below safety threshold
      - "emergingNeeds": Predict based on request trends and historical patterns
      - Validate against current inventory
      Use EXACT location names do not use Coordinates from requests as JSON keys.
      Output STRICT JSON format:
      {
  "missingTypes": [
    {
      "name": "Pantop-D",
      "type": "medicine",
      "quantityNeeded": 100,
      "reason": "earthquake injuries",
      "urgency": "high",
      "thresholdDeficit": 75
    }, {
    "name": "no data available",
    "type": "null",
    "currentAmount": 0,
    "depletionTime": "null",
    "depletionProbability": 0.0,
    "trend": "null",
    "velocity": 0.0,
    "confidence": 0.0
  }
  ],
  "immediateNeeds": [
    {
      "name": "Azithromycin",
      "type": "antibiotic",
      "quantityNeeded": 200,
      "reason": "earthquake-related infections",
      "location": "Actual Location A",
      "timeCriticality": "24h"
    },
     {
    "name": "no data available",
    "type": "null",
    "currentAmount": 0,
    "depletionTime": "null",
    "depletionProbability": 0.0,
    "trend": "null",
    "velocity": 0.0,
    "confidence": 0.0
  }
  ],
  "surplusResources": [
    {
      "name": "blankets",
      "type": "non-medical",
      "quantity": 200,
      "location": "Actual Location B",
      "reallocationSuggestion": "Disaster Zone X"
    },
     {
    "name": "no data available",
    "type": "null",
    "currentAmount": 0,
    "depletionTime": "null",
    "depletionProbability": 0.0,
    "trend": "null",
    "velocity": 0.0,
    "confidence": 0.0
  }
  ],
  "emergingNeeds": [
    {
      "name": "generators",
      "type": "equipment",
      "predictedNeed": 50,
      "timeframe": "12h",
      "confidence": 0.85,
      "triggerFactor": "power grid failure"
    },
    {
      "name": "water",
      "type": "essential",
      "predictedNeed": 300,
      "timeframe": "24h",
      "confidence": 0.9,
      "triggerFactor": "sanitation crisis"
    }, {
    "name": "no data available",
    "type": "null",
    "currentAmount": 0,
    "depletionTime": "null",
    "depletionProbability": 0.0,
    "trend": "null",
    "velocity": 0.0,
    "confidence": 0.0
  }
  ],
  "meta": {
    "analysisTimestamp": "2025-06-07T12:00:00Z",
    "dataSources": ["currentInventory", "requestLogs", "historicalTrends"]
  }
}
      
      Current State: ${JSON.stringify({
        requested: requested.slice(0, 30),
        available: available.slice(0, 30),
      })}
      Historical Trends: ${JSON.stringify(history.slice(0, 50))}
      - DO NOT include any comments, explanations, or trailing text. Only pure JSON.
      `;

      const gapResult = await model.generateContent(gapPrompt);
      const gapText = await gapResult.response.text();
      console.log("Gap Text: ", gapText);

      setGapAnalysis(parseGeminiResponse(gapText));

      // 3. Enhanced Depletion Prediction with ML-like analysis
      const depletionPrompt = `
        Predict resource depletion with ML-style analysis. Include:
      - Depletion time calculations
      - Probability scores
      - Trend velocity metrics
        Provide ONLY valid JSON output:
        [{
        "name":"Pantop-D"
          "type": "medical",
          "currentAmount": 100,
          "depletionTime": "2023-12-25T15:00:00",
          "depletionProbability": 0.85,
          "trend": "accelerating_decline",
          "velocity": -5.2,
          "confidence": 0.91
        }, {
    "name": "no data available",
    "type": "null",
    "currentAmount": 0,
    "depletionTime": "null",
    "depletionProbability": 0.0,
    "trend": "null",
    "velocity": 0.0,
    "confidence": 0.0
  }]
        
        Current Resources: ${JSON.stringify(available?.slice(0, 20))}
        Historical Consumption: ${JSON.stringify(history?.slice(0, 100))}
        Active Requests: ${JSON.stringify(requested?.slice(0, 20))}
        - DO NOT include any comments, explanations, or trailing text. Only pure JSON.
      `;

      const depletionResult = await model.generateContent(depletionPrompt);
      const depletionText = await depletionResult.response.text();
      console.log("Deplition Test: ", depletionText);
      setDepletionPredictions(parseGeminiResponse(depletionText));

      // 4. 24-hour Prediction Timeline
      const timelinePrompt = `
      Generate a 24-hour resource prediction timeline with these rules:

- Output must be a JSON array of 24 items (hour 0 to 23)
- Each object must contain "hour" and "resources" keys
- "resources" maps to:
  - "remaining": predicted amount
  - "trend": based on velocity and thresholds
  - "velocity": rate of change per hour (negative = usage)

Assume:
- No replenishment during this window
- Velocity is derived from recent 6-hour trends
- Use these thresholds to classify trend:
  - water: critical if < 1000 liters
  - medical_kits: critical if < 10 units
  - medicine: critical if < 500 units
  - food: critical if < 300 units
- Trend definitions:
  - "critical": below threshold
  - "declining": velocity < 0 but above threshold
  - "stable": velocity = 0
  - "improving": velocity > 0

Format:
[
  {
    "hour": 0,
    "resources": {
      "water": {"remaining": 1500, "trend": "declining", "velocity": -120},
      "medical_kits": {"remaining": 9, "trend": "critical", "velocity": -2}
    }
  }
]
Only return valid JSON. Do not include markdown, comments, or explanation.
Use this base data:
${JSON.stringify({
  current: available.slice(0, 10),
  history: history.slice(0, 50),
  requests: requested.slice(0, 10),
})}

      `;

      const timelineResult = await model.generateContent(timelinePrompt);
      const timelineText = await timelineResult.response.text();
      console.log("Timelien Test: ", timelineText);
      setPredictionTimeline(parseGeminiResponse(timelineText));
    } catch (error) {
      console.error("Enhanced analysis failed:", error);
      setError("Failed to perform enhanced analysis. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    setLastUpdate(new Date());
  }, []);
  // Initial setup and cleanup
  useEffect(() => {
    if (!isClient) return;
    const initializeAnalytics = async () => {
      await analyzeDataWithHistory();
    };

    initializeAnalytics();

    // Setup real-time subscriptions
    const cleanup = setupRealTimeSubscriptions();

    // Periodic updates (reduced frequency since we have real-time)
    const interval = setInterval(analyzeDataWithHistory, 300000); // 5 minutes

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [setupRealTimeSubscriptions, isClient]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Resource Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <div
            className={`flex items-center space-x-2 ${
              isRealTimeConnected ? "text-green-600" : "text-red-600"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isRealTimeConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm">
              {isRealTimeConnected
                ? "Real-time Connected"
                : "Real-time Disconnected"}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Last Update:{" "}
            {isClient && lastUpdate
              ? lastUpdate.toLocaleTimeString()
              : "Initializing..."}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Performing advanced analytics...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* 24-Hour Prediction Timeline */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              24-Hour Resource Prediction Timeline
            </h2>
            {predictionTimeline.length > 0 ? (
              <PredictionTimeline data={predictionTimeline} />
            ) : (
              <p>No prediction timeline available</p>
            )}
          </div>

          {/* Enhanced Priority Scores */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Location Priority Scores (Real-time Updated)
            </h2>
            {Object.keys(priorityScores).length > 0 ? (
              <BarChart
                data={Object.entries(priorityScores).map(
                  ([location, score]) => ({
                    label: location,
                    value: Number(score),
                  })
                )}
              />
            ) : (
              <p>No priority data available</p>
            )}
          </div>

          {/* Enhanced Gap Analysis */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Advanced Resource Gap Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <h3 className="font-medium text-red-600">Missing Types</h3>
                {gapAnalysis.missingTypes?.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {gapAnalysis.missingTypes.map(
                      (item: any, index: number) => (
                        <li key={`missing-${index}`} className="text-sm">
                          <span className="font-medium">
                            {item.name || item.type}
                          </span>
                          <br />
                          <span>Need: {item.quantityNeeded} units</span>
                          {item.trend && (
                            <span className="text-gray-600">
                              {" "}
                              ({item.trend})
                            </span>
                          )}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">No missing resources</p>
                )}
              </div>

              <div>
                <h3 className="font-medium text-orange-600">Immediate Needs</h3>
                {gapAnalysis.immediateNeeds?.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {gapAnalysis.immediateNeeds.map(
                      (item: ImmediateNeed, index: number) => (
                        <li key={`immediate-${index}`} className="text-sm">
                          <strong>{item.name}</strong> ({item.type}) –{" "}
                          {item.quantity} units needed at{" "}
                          <span className="text-orange-700 font-medium">
                            {item.location}
                          </span>{" "}
                          due to <em>{item.reason}</em>
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">No immediate needs</p>
                )}
              </div>

              <div>
                <h3 className="font-medium text-green-600">
                  Surplus Resources
                </h3>
                {gapAnalysis.surplusResources?.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {gapAnalysis.surplusResources.map(
                      (item: any, index: number) => (
                        <li key={`surplus-${index}`} className="text-sm">
                          <span className="font-medium">{item.name}</span>
                          <br />
                          Extra: {item.quantity}
                          {item.location && (
                            <span className="block text-xs text-gray-500">
                              Location: {item.location}
                            </span>
                          )}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">No surplus resources</p>
                )}
              </div>

              <div>
                <h3 className="font-medium text-blue-600">Emerging Needs</h3>
                {gapAnalysis.emergingNeeds?.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {gapAnalysis.emergingNeeds.map(
                      (item: any, index: number) => (
                        <li key={`emerging-${index}`} className="text-sm">
                          <span className="font-medium">{item.name}</span>
                          <br />
                          <span>Predicted: {item.predictedNeed} units</span>
                          <br />
                          <span className="text-gray-600">
                            in {item.timeframe}
                          </span>
                          {item.confidence && (
                            <span className="block text-xs text-gray-500">
                              Confidence: {item.confidence * 100}%
                            </span>
                          )}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">
                    No emerging needs predicted
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Depletion Predictions */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Advanced Depletion Predictions
            </h2>
            {depletionPredictions.length > 0 ? (
              <>
                <PieChart
                  data={depletionPredictions.map((item: any) => ({
                    label: `${item.name} (${(
                      item.depletionProbability * 100
                    ).toFixed(1)}%)`,
                    value: item.depletionProbability * 100,
                  }))}
                />
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b bg-gray-50 dark:bg-gray-700">
                        <th className="p-3">Resource</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Current</th>
                        <th className="p-3">Depletion Time</th>
                        <th className="p-3">Probability</th>
                        <th className="p-3">Trend</th>
                        <th className="p-3">Velocity</th>
                        <th className="p-3">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depletionPredictions.map((item: any, index: number) => (
                        <tr
                          key={`depletion-${index}`}
                          className="border-b hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="p-3 font-medium">{item.type}</td>
                          <td className="p-3 font-medium">{item.name}</td>
                          <td className="p-3">{item.currentAmount}</td>
                          <td className="p-3">
                            {new Date(item.depletionTime).toLocaleString()}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                item.depletionProbability > 0.8
                                  ? "bg-red-100 text-red-800"
                                  : item.depletionProbability > 0.5
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {(item.depletionProbability * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`text-xs ${
                                item.trend?.includes("accelerating")
                                  ? "text-red-600"
                                  : item.trend?.includes("stable")
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {item.trend || "N/A"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={
                                item.velocity < 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            >
                              {item.velocity?.toFixed(2) || "N/A"}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-xs">
                              {item.confidence
                                ? `${(item.confidence * 100).toFixed(1)}%`
                                : "N/A"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p>No depletion predictions available</p>
            )}
          </div>

          {/* Resource History Summary */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Resource History Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {resourceHistory.length}
                </div>
                <div className="text-sm text-gray-600">
                  Total History Records
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {availableResources.length}
                </div>
                <div className="text-sm text-gray-600">Active Resources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {requestedResources.length}
                </div>
                <div className="text-sm text-gray-600">Pending Requests</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
