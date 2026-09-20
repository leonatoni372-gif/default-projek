"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const demoFinance = [
  { month: "Jan", revenue: 400, profit: 240 },
  { month: "Feb", revenue: 300, profit: 139 },
  { month: "Mar", revenue: 200, profit: 980 },
  { month: "Apr", revenue: 278, profit: 390 },
  { month: "May", revenue: 189, profit: 480 },
];

const demoPerformance = [
  { name: "V1", views: 4000, clicks: 240, orders: 24 },
  { name: "V2", views: 3000, clicks: 139, orders: 13 },
  { name: "V3", views: 2000, clicks: 980, orders: 18 },
  { name: "V4", views: 2780, clicks: 390, orders: 22 },
];

export function FinanceChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={demoFinance}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="revenue" fill="#8884d8" />
        <Bar dataKey="profit" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={demoPerformance}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="views" stroke="#8884d8" />
        <Line type="monotone" dataKey="clicks" stroke="#82ca9d" />
        <Line type="monotone" dataKey="orders" stroke="#ffc658" />
      </LineChart>
    </ResponsiveContainer>
  );
}
