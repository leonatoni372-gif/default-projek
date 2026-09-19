export const metadata = { title: 'Analytics — AI Affiliate OS' };

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>
      <div style={{ marginTop: '1rem' }}>
        <h2>Content Performance</h2>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', marginBottom: '1rem' }}>
          <p>Total Views: 12,000</p>
          <p>CTR: 2.5%</p>
          <p>CVR: 1.8%</p>
          <p>Earnings per 1k Views: $25.00</p>
          <p>Profit per Content: $45.00</p>
          <p>Engagement Rate: 8.2%</p>
        </div>

        <h2>Product Performance</h2>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <p>AI Affiliate Masterclass: $360 commission, 30% conversion</p>
          <p>Smart Content Tool: $200 commission, 20% conversion</p>
        </div>

        <h2>Trend Analysis</h2>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', marginTop: '1rem' }}>
          <p>📈 AI productivity tools: Trending up (+0.72 signal)</p>
          <p>📈 Affiliate marketing AI: Trending up (+0.65 signal)</p>
          <p>📉 Expensive software: Trending down (-0.31 signal)</p>
        </div>
      </div>
    </div>
  );
}