"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const demoPerformance = [
  { name: "V1", views: 4000, ctr: 2.5, cvr: 1.8, retention: 45 },
  { name: "V2", views: 3000, ctr: 3.1, cvr: 2.2, retention: 52 },
  { name: "V3", views: 2000, ctr: 1.8, cvr: 0.9, retention: 38 },
  { name: "V4", views: 2780, ctr: 4.2, cvr: 3.0, retention: 61 },
  { name: "V5", views: 1500, ctr: 2.0, cvr: 1.5, retention: 42 },
];

const demoTrends = [
  { keyword: "AI productivity tools", direction: "up", confidence: 0.78 },
  { keyword: "affiliate marketing AI", direction: "up", confidence: 0.65 },
  { keyword: "expensive software", direction: "down", confidence: 0.31 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
        <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: 8 }}>
          <h3>Views Over Content</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={demoPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="views" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: 8 }}>
          <h3>CTR and CVR Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={demoPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ctr" stroke="#8884d8" name="CTR %" />
              <Line type="monotone" dataKey="cvr" stroke="#82ca9d" name="CVR %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <h2>Content Performance Summary</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "Total Views", value: "13,280" },
            { label: "Avg CTR", value: "2.72%" },
            { label: "Avg CVR", value: "1.88%" },
            { label: "Avg Retention", value: "47.6%" },
            { label: "Earnings/1k Views", value: "$25.00" },
            { label: "Profit/Content", value: "$45.00" },
          ].map((s) => (
            <div key={s.label} style={{ padding: "0.75rem", background: "#f5f5f5", borderRadius: 8 }}>
              <div style={{ fontSize: "0.75rem", color: "#666" }}>{s.label}</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 600 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <h2>Trend Analysis</h2>
        {demoTrends.map((t) => (
          <div
            key={t.keyword}
            style={{
              padding: "0.75rem",
              marginBottom: "0.5rem",
              background: t.direction === "up" ? "#f0fdf4" : "#fef2f2",
              borderRadius: 8,
              borderLeft: `4px solid ${t.direction === "up" ? "#22c55e" : "#ef4444"}`,
            }}
          >
            <span style={{ fontWeight: 500 }}>{t.keyword}</span>
            <span style={{ marginLeft: "0.5rem", color: t.direction === "up" ? "green" : "red" }}>
              {t.direction === "up" ? "+" : "-"}{t.confidence} signal
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
