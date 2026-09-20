import { Metadata } from "next";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FinanceChart, PerformanceChart } from "@/components/Charts";

export const metadata: Metadata = { title: "Overview — AI Affiliate OS" };

export default function DashboardOverview() {
  return (
    <div>
      <h1>Dashboard Overview</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <StatCard title="Revenue" value="$1,200" change="+12%" />
        <StatCard title="Profit" value="$1,050" change="+8%" />
        <StatCard title="Orders" value="20" />
        <StatCard title="Commission" value="$360" />
        <StatCard title="Expenses" value="$150" />
        <StatCard title="Views" value="12,000" />
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h2>AI CEO Recommendations</h2>
        <div style={{ padding: "1rem", background: "#f0f4ff", borderRadius: "8px" }}>
          <ul>
            <li>Research high-potential product: AI Affiliate Masterclass (score: 0.85)</li>
            <li>Review pending approvals (3 items awaiting human approval)</li>
            <li>A/B test different CTAs on TikTok videos</li>
            <li>Review financial performance — profit margin at 10%</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <ErrorBoundary>
          <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "8px" }}>
            <h3>Revenue vs Profit</h3>
            <FinanceChart />
          </div>
        </ErrorBoundary>
        <ErrorBoundary>
          <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "8px" }}>
            <h3>Content Performance</h3>
            <PerformanceChart />
          </div>
        </ErrorBoundary>
      </div>

      <div style={{ marginTop: "2rem", padding: "1rem", background: "#fff4f4", borderRadius: "8px" }}>
        <h3>Warnings</h3>
        <ul>
          <li>Profit margin below 10% — urgent review needed</li>
          <li>Expenses are more than 50% of commissions</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ title, value, change }: { title: string; value: string; change?: string }) {
  return (
    <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "8px" }}>
      <h3 style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>{title}</h3>
      <p style={{ fontSize: "1.5rem", margin: "0.25rem 0" }}>{value}</p>
      {change && <p style={{ color: "green", margin: 0 }}>{change}</p>}
    </div>
  );
}
