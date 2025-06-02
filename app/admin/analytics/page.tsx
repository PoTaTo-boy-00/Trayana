"use client";

import { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";
import { BarChart, PieChart } from "@/app/components/charts";

const AnalyticsPage = () => {
  const [requestedResources, setRequestedResources] = useState<any[]>([]);
  const [availableResources, setAvailableResources] = useState<any[]>([]);
  const [priorityScores, setPriorityScores] = useState<{
    [key: string]: number;
  }>({});
  const [gapAnalysis, setGapAnalysis] = useState<any>({
    missingTypes: [],
    immediateNeeds: [],
    surplusResources: [],
  });
  const [depletionPredictions, setDepletionPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(
    process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
  );

  // Fetch data from Supabase
  const fetchData = async () => {
    try {
      const { data: requested, error: reqError } = await supabase
        .from("requestresources")
        .select("*");

      const { data: available, error: availError } = await supabase
        .from("resources")
        .select("*");

      if (reqError || availError) {
        throw reqError || availError;
      }

      setRequestedResources(requested || []);
      setAvailableResources(available || []);
      return { requested, available };
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to fetch data from database");
      return { requested: [], available: [] };
    }
  };

  // Helper function to parse Gemini response
  const parseGeminiResponse = (text: string) => {
    try {
      // Try to extract JSON from markdown code block
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      // Try to parse directly if no code block
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse response:", text);
      throw new Error("Invalid JSON response from AI model");
    }
  };

  // Analyze data with Gemini
  const analyzeData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { requested, available } = await fetchData();
      if (!requested || !available) return;

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
      });

      // 1. Priority Scoring
      const priorityPrompt = `
        Analyze these disaster resource requests and calculate priority scores (1-10) for each location.
        Provide ONLY valid JSON output in this exact format: 
        { "location1": score, "location2": score }
        
        Requests: ${JSON.stringify(
          requested?.map((r: any) => ({
            location: r.location,
            type: r.type,
            urgency: r.urgency,
            disasterType: r.disasterType,
            lastUpdated: r.lastUpdated,
          }))
        )}
      `;

      const priorityResult = await model.generateContent(priorityPrompt);
      const priorityText = await priorityResult.response.text();
      setPriorityScores(parseGeminiResponse(priorityText));

      // 2. Gap Analysis
      const gapPrompt = `
        Compare requested vs available resources and provide ONLY valid JSON output in this exact format:
        {
          "missingTypes": [{"type": "water", "quantityNeeded": 100}],
          "immediateNeeds": ["locationA", "locationB"],
          "surplusResources": [{"type": "blankets", "quantity": 50}]
        }
        
        Requested: ${JSON.stringify(requested)}
        Available: ${JSON.stringify(available)}
      `;

      const gapResult = await model.generateContent(gapPrompt);
      const gapText = await gapResult.response.text();
      setGapAnalysis(parseGeminiResponse(gapText));

      // 3. Depletion Prediction
      const depletionPrompt = `
        Predict resource depletion based on current data. Provide ONLY valid JSON output in this exact format:
        [{
          "type": "medical",
          "currentAmount": 100,
          "depletionTime": "2023-12-25T15:00:00",
          "depletionProbability": 0.85
        }]
        
        Resources: ${JSON.stringify(available)}
        Requests: ${JSON.stringify(requested)}
        Update frequency: 10 minutes
      `;

      const depletionResult = await model.generateContent(depletionPrompt);
      const depletionText = await depletionResult.response.text();
      setDepletionPredictions(parseGeminiResponse(depletionText));
    } catch (error) {
      console.error("Analysis failed:", error);
      setError("Failed to analyze data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and periodic updates
  useEffect(() => {
    analyzeData();
    const interval = setInterval(analyzeData, 600000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Resource Analytics Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div>Loading analytics...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Priority Scores Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Location Priority Scores
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

          {/* Gap Analysis */}
          <div className="bg-white dark:bg-black p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Resource Gaps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium">Missing Types</h3>
                {gapAnalysis.missingTypes?.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {gapAnalysis.missingTypes.map((item: any) => (
                      <li key={item.type}>
                        {item.type} (Need: {item.quantityNeeded})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No missing resources</p>
                )}
              </div>
              <div>
                <h3 className="font-medium">Immediate Needs</h3>
                {gapAnalysis.immediateNeeds?.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {gapAnalysis.immediateNeeds.map((location: string) => (
                      <li key={location}>{location}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No immediate needs</p>
                )}
              </div>
              <div>
                <h3 className="font-medium">Surplus Resources</h3>
                {gapAnalysis.surplusResources?.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {gapAnalysis.surplusResources.map((item: any) => (
                      <li key={item.type}>
                        {item.type} (Extra: {item.quantity})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No surplus resources</p>
                )}
              </div>
            </div>
          </div>

          {/* Depletion Predictions */}
          <div className="bg-white dark:bg-black p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Depletion Predictions
            </h2>
            {depletionPredictions.length > 0 ? (
              <>
                <PieChart
                  data={depletionPredictions.map((item: any) => ({
                    label: item.type,
                    value: item.depletionProbability * 100,
                  }))}
                />
                <table className="w-full mt-4">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Resource</th>
                      <th className="p-2">Current Amount</th>
                      <th className="p-2">Depletion Time</th>
                      <th className="p-2">Probability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depletionPredictions.map((item: any, index: number) => (
                      <tr key={`${item.type}-${index}`} className="border-b">
                        <td className="p-2">{item.type}</td>
                        <td className="p-2">{item.currentAmount}</td>
                        <td className="p-2">
                          {new Date(item.depletionTime).toLocaleString()}
                        </td>
                        <td className="p-2">
                          {(item.depletionProbability * 100).toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <p>No depletion predictions available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
