"use client";

import { useEffect, useState, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";
import { BarChart, PieChart } from "@/app/components/charts";
import PredictionTimeline from "@/app/components/predictiveTimeline";

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
  immediateNeeds: string[];
  surplusResources: GapAnalysisItem[];
  emergingNeeds?: GapAnalysisItem[];
}

const AnalyticsPage = () => {
  const [requestedResources, setRequestedResources] = useState<any[]>([]);
  const [availableResources, setAvailableResources] = useState<any[]>([]);
  const [resourceHistory, setResourceHistory] = useState<ResourceHistory[]>([]);
  const [priorityScores, setPriorityScores] = useState<{
    [key: string]: number;
  }>({});
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis>({
    missingTypes: [],
    immediateNeeds: [],
    surplusResources: [],
    emergingNeeds: [],
  });
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
        .limit(1000);

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
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(text);
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
        Analyze these disaster resource requests with historical context and calculate priority scores (1-10).
        Consider trend analysis, depletion velocity, and urgency patterns.
        Provide ONLY valid JSON output: { "location1": score, "location2": score }
        
        Current Requests: ${JSON.stringify(requested?.slice(0, 50))}
        Historical Data: ${JSON.stringify(history?.slice(0, 100))}
      `;

      const priorityResult = await model.generateContent(priorityPrompt);
      const priorityText = await priorityResult.response.text();
      setPriorityScores(parseGeminiResponse(priorityText));

      // 2. Enhanced Gap Analysis with predictive elements
      const gapPrompt = `
        Perform advanced gap analysis with historical trends and predictive insights.
        Provide ONLY valid JSON output:
        {
          "missingTypes": [{"type": "water", "quantityNeeded": 100, "trend": "increasing"}],
          "immediateNeeds": ["locationA"],
          "surplusResources": [{"type": "blankets", "quantity": 50, "trend": "stable"}],
          "emergingNeeds": [{"type": "medical", "predictedNeed": 75, "timeframe": "6 hours"}]
        }
        
        Current State: ${JSON.stringify({
          requested: requested?.slice(0, 30),
          available: available?.slice(0, 30),
        })}
        Historical Trends: ${JSON.stringify(history?.slice(0, 50))}
      `;

      const gapResult = await model.generateContent(gapPrompt);
      const gapText = await gapResult.response.text();
      setGapAnalysis(parseGeminiResponse(gapText));

      // 3. Enhanced Depletion Prediction with ML-like analysis
      const depletionPrompt = `
        Create advanced depletion predictions using historical consumption patterns and trend analysis.
        Analyze velocity, acceleration, and seasonal patterns if any.
        Provide ONLY valid JSON output:
        [{
          "type": "medical",
          "currentAmount": 100,
          "depletionTime": "2023-12-25T15:00:00",
          "depletionProbability": 0.85,
          "trend": "accelerating_decline",
          "velocity": -5.2,
          "confidence": 0.91
        }]
        
        Current Resources: ${JSON.stringify(available?.slice(0, 20))}
        Historical Consumption: ${JSON.stringify(history?.slice(0, 100))}
        Active Requests: ${JSON.stringify(requested?.slice(0, 20))}
      `;

      const depletionResult = await model.generateContent(depletionPrompt);
      const depletionText = await depletionResult.response.text();
      setDepletionPredictions(parseGeminiResponse(depletionText));

      // 4. 24-hour Prediction Timeline
      const timelinePrompt = `
        Generate 24-hour resource prediction timeline based on historical patterns.
        Provide ONLY valid JSON output as array of hourly predictions:
        [
          {
            "hour": 1,
            "resources": {
              "water": {"remaining": 150, "trend": "decreasing", "velocity": -2.5},
              "medical": {"remaining": 75, "trend": "stable", "velocity": 0.1}
            }
          }
        ]
        
        Base Data: ${JSON.stringify({
          current: available?.slice(0, 10),
          history: history?.slice(0, 50),
          requests: requested?.slice(0, 10),
        })}
      `;

      const timelineResult = await model.generateContent(timelinePrompt);
      const timelineText = await timelineResult.response.text();
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
        <h1 className="text-2xl font-bold">
          Enhanced Resource Analytics Dashboard
        </h1>
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
                      (item: GapAnalysisItem, index: number) => (
                        <li key={`missing-${index}`} className="text-sm">
                          <span className="font-medium">
                            {String(item.type || "Unknown")}
                          </span>
                          <br />
                          Need: {String(item.quantityNeeded || "N/A")}
                          {item.trend && (
                            <span className="text-gray-600">
                              {" "}
                              ({String(item.trend)})
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
                      (location: string, index: number) => (
                        <li key={`immediate-${index}`} className="text-sm">
                          {String(location)}
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
                      (item: GapAnalysisItem, index: number) => (
                        <li key={`surplus-${index}`} className="text-sm">
                          <span className="font-medium">
                            {String(item.type || "Unknown")}
                          </span>
                          <br />
                          Extra: {String(item.quantity || "N/A")}
                          {item.trend && (
                            <span className="text-gray-600">
                              {" "}
                              ({String(item.trend)})
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
                {(gapAnalysis.emergingNeeds ?? []).length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {(gapAnalysis.emergingNeeds ?? []).map(
                      (item: GapAnalysisItem, index: number) => (
                        <li key={`emerging-${index}`} className="text-sm">
                          <span className="font-medium">
                            {String(item.type || "Unknown")}
                          </span>
                          <br />
                          Predicted: {String(item.predictedNeed || "N/A")}
                          <br />
                          <span className="text-gray-600">
                            in {String(item.timeframe || "Unknown")}
                          </span>
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
                  data={depletionPredictions.map(
                    (item: EnhancedDepletionPrediction) => ({
                      label: `${item.type} (${(
                        item.depletionProbability * 100
                      ).toFixed(1)}%)`,
                      value: item.depletionProbability * 100,
                    })
                  )}
                />
                <div className="overflow-x-auto mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b bg-gray-50 dark:bg-gray-700">
                        <th className="p-3">Resource</th>
                        <th className="p-3">Current</th>
                        <th className="p-3">Depletion Time</th>
                        <th className="p-3">Probability</th>
                        <th className="p-3">Trend</th>
                        <th className="p-3">Velocity</th>
                        <th className="p-3">Confidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {depletionPredictions.map(
                        (item: EnhancedDepletionPrediction, index: number) => (
                          <tr
                            key={`depletion-${index}`}
                            className="border-b hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="p-3 font-medium">
                              {String(item.type)}
                            </td>
                            <td className="p-3">
                              {String(item.currentAmount)}
                            </td>
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
                                {String(item.trend || "N/A")}
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
                        )
                      )}
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
