"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Product = {
  id: string;
  name: string;
  price: number;
  commission_rate: number;
  status: string;
  confidence_score?: number;
  historical_performance?: { views: number; clicks: number; orders: number; revenue: number };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => { setProducts(d.products || []); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  const chartData = products.map((p) => ({
    name: p.name.length > 16 ? p.name.slice(0, 16) + "..." : p.name,
    revenue: p.historical_performance?.revenue || 0,
    orders: p.historical_performance?.orders || 0,
  }));

  return (
    <div>
      <h1>Products</h1>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && (
        <>
          <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: 8, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>Price</th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>Commission</th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>Views</th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>Orders</th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>Revenue</th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "0.5rem" }}>{p.name}</td>
                    <td style={{ padding: "0.5rem" }}>${p.price}</td>
                    <td style={{ padding: "0.5rem" }}>{p.commission_rate}%</td>
                    <td style={{ padding: "0.5rem" }}>{p.historical_performance?.views?.toLocaleString() || "-"}</td>
                    <td style={{ padding: "0.5rem" }}>{p.historical_performance?.orders || "-"}</td>
                    <td style={{ padding: "0.5rem" }}>${p.historical_performance?.revenue?.toLocaleString() || "-"}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <span style={{ color: p.status === "active" ? "green" : "#999" }}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {chartData.length > 0 && (
            <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#f5f5f5", borderRadius: 8 }}>
              <h3>Revenue by Product</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
