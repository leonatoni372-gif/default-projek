"use client";

import { useEffect, useState } from "react";

type AgentRun = {
  agent_name: string;
  status: string;
  started_at: string;
  duration_ms?: number;
  token_usage?: number;
  error_message?: string;
};

const agentNames = ["ceo", "trend", "productResearch", "productScoring", "finance", "content", "creative", "compliance", "evaluator", "experiment", "memory"];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [runs, setRuns] = useState<AgentRun[]>([]);

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((d) => setRuns(d.runs || []))
      .catch(() => {});
  }, []);

  function agentRunCount(name: string) {
    return runs.filter((r) => r.agent_name === name).length;
  }

  function agentLastRun(name: string) {
    const last = runs.filter((r) => r.agent_name === name).pop();
    return last ? new Date(last.started_at).toLocaleString() : "Never";
  }

  return (
    <div>
      <h1>Agents</h1>
      <p style={{ color: "#666" }}>Monitor agent runs, errors, latency, and token/cost data.</p>
      <div style={{ marginTop: "1rem" }}>
        {agentNames.map((name) => (
          <div
            key={name}
            onClick={() => setSelectedAgent(selectedAgent === name ? null : name)}
            style={{
              padding: "1rem",
              marginBottom: "0.5rem",
              background: selectedAgent === name ? "#e8f4fd" : "#f5f5f5",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>{name}</h3>
              <span style={{ color: "green", fontSize: "0.8rem" }}>Available</span>
            </div>
            {selectedAgent === name && (
              <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "#555" }}>
                <p style={{ margin: "0.15rem 0" }}>Runs: {agentRunCount(name)}</p>
                <p style={{ margin: "0.15rem 0" }}>Last run: {agentLastRun(name)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
