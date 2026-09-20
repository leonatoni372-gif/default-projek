"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type FinanceSummary = {
  total_revenue_actual: number;
  total_revenue_projected: number;
  total_commissions_actual: number;
  total_expenses: number;
  net_profit_actual: number;
  net_profit_projected: number;
  roi: number;
  profit_per_content: number[];
};

export default function FinancePage() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance")
      .then((r) => r.json())
      .then((d) => { setSummary(d.summary); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const profitByContent = summary?.profit_per_content.map((v, i) => ({
    name: "C" + (i + 1),
    profit: v,
  })) || [];

  return (
    <div>
      <h1>Finance</h1>
      {loading && <p>Loading...</p>}
      {summary && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
            <StatBox label="Revenue (Actual)" value={"$" + summary.total_revenue_actual.toLocaleString()} />
            <StatBox label="Revenue (Projected)" value={"$" + summary.total_revenue_projected.toLocaleString()} warn />
            <StatBox label="Commissions" value={"$" + summary.total_commissions_actual.toLocaleString()} />
            <StatBox label="Expenses" value={"$" + summary.total_expenses.toLocaleString()} />
            <StatBox label="Net Profit" value={"$" + summary.net_profit_actual.toLocaleString()} />
            <StatBox label="ROI" value={summary.roi + "%"} />
          </div>

          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#f5f5f5", borderRadius: 8 }}>
            <h3>Profit per Content</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={profitByContent}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="profit" fill="#82ca9d" name="Profit ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#fff4f4", borderRadius: 8, border: "1px solid #fecaca" }}>
            <strong>Important:</strong> Projected revenue (${summary.total_revenue_projected.toLocaleString()}) is NOT counted as realized revenue. Only actual commissions (${summary.total_commissions_actual.toLocaleString()}) count toward profit.
          </div>
        </>
      )}
    </div>
  );
}

function StatBox({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: 8 }}>
      <div style={{ fontSize: "0.75rem", color: "#666" }}>{label}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 600 }}>{value}</div>
      {warn && <div style={{ fontSize: "0.7rem", color: "#f59e0b" }}>Not counted as realized</div>}
    </div>
  );
}
