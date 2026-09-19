import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Overview — AI Affiliate OS' };

export default function DashboardOverview() {
  return (
    <div>
      <h1>Dashboard Overview</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Revenue</h3>
          <p style={{ fontSize: '1.5rem' }}>$1,200</p>
          <p style={{ color: 'green' }}>+12%</p>
        </div>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Profit</h3>
          <p style={{ fontSize: '1.5rem' }}>$1,050</p>
          <p style={{ color: 'green' }}>+8%</p>
        </div>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Orders</h3>
          <p style={{ fontSize: '1.5rem' }}>20</p>
        </div>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Commission</h3>
          <p style={{ fontSize: '1.5rem' }}>$360</p>
        </div>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Expenses</h3>
          <p style={{ fontSize: '1.5rem' }}>$150</p>
        </div>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Views</h3>
          <p style={{ fontSize: '1.5rem' }}>12,000</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>AI CEO Recommendations</h2>
        <div style={{ padding: '1rem', background: '#f0f4ff', borderRadius: '8px' }}>
          <ul>
            <li>✅ Research high-potential product: AI Affiliate Masterclass (score: 0.85)</li>
            <li>✅ Review pending approvals (3 items awaiting human approval)</li>
            <li>✅ A/B test different CTAs on TikTok videos</li>
            <li>⚠️ Review financial performance - profit margin at 10%</li>
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Warnings</h2>
        <div style={{ padding: '1rem', background: '#fff4f4', borderRadius: '8px' }}>
          <ul>
            <li>⚠️ Profit margin below 10% - urgent review needed</li>
            <li>⚠️ Expenses are more than 50% of commissions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}