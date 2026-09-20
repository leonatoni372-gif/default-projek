"use client";

import { useEffect, useState } from "react";

type Experiment = {
  id: string;
  name: string;
  hypothesis: string;
  type: string;
  status: "proposed" | "running" | "completed" | "cancelled";
  confidence: number;
  created_at: string;
};

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/experiments")
      .then((r) => r.json())
      .then((d) => { setExperiments(d.experiments || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Experiments</h1>
      {loading && <p>Loading...</p>}
      {!loading && experiments.length === 0 && <p>No experiments yet.</p>}
      {experiments.map((exp) => (
        <div key={exp.id} style={{ padding: "1rem", marginBottom: "0.5rem", background: "#f5f5f5", borderRadius: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0 }}>{exp.name}</h3>
            <StatusBadge status={exp.status} />
          </div>
          <p style={{ color: "#666", margin: "0.25rem 0", fontSize: "0.85rem" }}>{exp.hypothesis}</p>
          <div style={{ fontSize: "0.8rem", color: "#888" }}>
            Type: {exp.type} | Confidence: {(exp.confidence * 100).toFixed(0)}%
          </div>
        </div>
      ))}
      <div style={{ marginTop: "1rem", padding: "1rem", background: "#f0f4ff", borderRadius: 8 }}>
        <strong>Note:</strong> Do not call a result causal unless the experimental design justifies it.
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    proposed: "#f59e0b",
    running: "#3b82f6",
    completed: "#22c55e",
    cancelled: "#9ca3af",
  };
  return (
    <span style={{ background: colors[status] || "#ddd", color: "#fff", padding: "0.15rem 0.5rem", borderRadius: 12, fontSize: "0.75rem" }}>
      {status}
    </span>
  );
}
