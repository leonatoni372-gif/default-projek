"use client";

import { useEffect, useState } from "react";

type ComplianceIssue = {
  severity: string;
  message: string;
};

type ComplianceResult = {
  status: string;
  issues: ComplianceIssue[];
};

type ComplianceRecord = {
  id: string;
  content_item_id: string;
  status: string;
  issues: ComplianceIssue[];
  checked_at: string;
};

export default function CompliancePage() {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [testText, setTestText] = useState("");
  const [testResult, setTestResult] = useState<ComplianceResult | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch("/api/compliance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content_text: "placeholder", platform: "tiktok", has_affiliate_disclosure: false }) })
      .then(() => fetch("/api/compliance"))
      .then((r) => r.json())
      .then((d) => { setRecords(d.records || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const runTest = async () => {
    if (!testText.trim()) return;
    setTesting(true);
    try {
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_text: testText,
          platform: "tiktok",
          has_affiliate_disclosure: testText.toLowerCase().includes("affiliate"),
        }),
      });
      const data = await res.json();
      setTestResult(data.result);
    } catch {
      setTestResult({ status: "ERROR", issues: [{ severity: "critical", message: "Failed to check compliance" }] });
    }
    setTesting(false);
  };

  const stats = {
    total: records.length,
    passed: records.filter((r) => r.status === "PASS").length,
    blocked: records.filter((r) => r.status === "BLOCKED").length,
    needsRevision: records.filter((r) => r.status === "NEEDS_REVISION").length,
  };

  return (
    <div>
      <h1>Compliance</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
        <StatBox label="Total Checks" value={String(stats.total)} />
        <StatBox label="Passed" value={String(stats.passed)} color="#22c55e" />
        <StatBox label="Blocked" value={String(stats.blocked)} color="#ef4444" />
        <StatBox label="Needs Revision" value={String(stats.needsRevision)} color="#f59e0b" />
      </div>

      <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#f5f5f5", borderRadius: 8 }}>
        <h3>Quick Compliance Check</h3>
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Enter content text to check..."
            style={{ flex: 1, padding: "0.5rem", borderRadius: 4, border: "1px solid #ddd" }}
            onKeyDown={(e) => e.key === "Enter" && runTest()}
          />
          <button onClick={runTest} disabled={testing} style={{ padding: "0.5rem 1rem", borderRadius: 4, border: "none", background: "#3b82f6", color: "#fff", cursor: "pointer" }}>
            {testing ? "Checking..." : "Check"}
          </button>
        </div>

        {testResult && (
          <div style={{ marginTop: "1rem", padding: "1rem", borderRadius: 8, border: `1px solid ${testResult.status === "PASS" ? "#22c55e" : testResult.status === "BLOCKED" ? "#ef4444" : "#f59e0b"}`, background: testResult.status === "PASS" ? "#f0fdf4" : testResult.status === "BLOCKED" ? "#fef2f2" : "#fffbeb" }}>
            <strong>{testResult.status === "PASS" ? "✅" : testResult.status === "BLOCKED" ? "🚫" : "⚠️"} {testResult.status}</strong>
            {testResult.issues.length > 0 && (
              <ul style={{ marginTop: "0.5rem", paddingLeft: "1.5rem" }}>
                {testResult.issues.map((issue, i) => (
                  <li key={i} style={{ color: issue.severity === "critical" ? "#ef4444" : "#f59e0b" }}>
                    [{issue.severity}] {issue.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {loading && <p>Loading...</p>}

      {!loading && records.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3>Recent Checks</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                <th style={{ padding: "0.5rem" }}>Status</th>
                <th style={{ padding: "0.5rem" }}>Content ID</th>
                <th style={{ padding: "0.5rem" }}>Issues</th>
                <th style={{ padding: "0.5rem" }}>Checked At</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem" }}>
                    <span style={{ color: r.status === "PASS" ? "#22c55e" : r.status === "BLOCKED" ? "#ef4444" : "#f59e0b", fontWeight: 600 }}>
                      {r.status === "PASS" ? "✅" : r.status === "BLOCKED" ? "🚫" : "⚠️"} {r.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem", fontSize: "0.85rem", color: "#666" }}>{r.content_item_id.slice(0, 8)}...</td>
                  <td style={{ padding: "0.5rem" }}>{r.issues.length}</td>
                  <td style={{ padding: "0.5rem", fontSize: "0.85rem", color: "#666" }}>{new Date(r.checked_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && records.length === 0 && (
        <p style={{ marginTop: "1rem", color: "#666" }}>No compliance checks recorded yet. Use the quick check above or the bot command /compliance.</p>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: 8 }}>
      <div style={{ fontSize: "0.75rem", color: "#666" }}>{label}</div>
      <div style={{ fontSize: "1.5rem", fontWeight: 600, color: color || "inherit" }}>{value}</div>
    </div>
  );
}
