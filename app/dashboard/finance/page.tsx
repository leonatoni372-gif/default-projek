export const metadata = { title: 'Finance — AI Affiliate OS' };

export default function FinancePage() {
  return (
    <div>
      <h1>Finance</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Revenue (Actual)</h3>
          <p style={{ fontSize: '1.5rem' }}>$1,200</p>
        </div>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Revenue (Projected)</h3>
          <p style={{ fontSize: '1.5rem' }}>$2,000</p>
          <p style={{ color: 'orange', fontSize: '0.8rem' }}>⚠️ Not counted as realized</p>
        </div>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Expenses</h3>
          <p style={{ fontSize: '1.5rem' }}>$150</p>
        </div>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>ROI</h3>
          <p style={{ fontSize: '1.5rem' }}>700%</p>
        </div>
        <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Net Profit</h3>
          <p style={{ fontSize: '1.5rem' }}>$1,050</p>
        </div>
      </div>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#fff4f4', borderRadius: '8px' }}>
        <h3>⚠️ Important</h3>
        <p>Projected revenue ($2,000) is NOT counted as realized revenue. Only actual commissions ($360) are counted toward profit.</p>
      </div>
    </div>
  );
}