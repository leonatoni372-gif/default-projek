import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🤖 AI Affiliate OS</h1>
      <p>AI-powered affiliate operating system</p>
      
      <nav style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/products">Products</Link>
        <Link href="/dashboard/content">Content Pipeline</Link>
        <Link href="/dashboard/finance">Finance</Link>
        <Link href="/dashboard/analytics">Analytics</Link>
        <Link href="/dashboard/agents">Agents</Link>
        <Link href="/dashboard/settings">Settings</Link>
        <Link href="/dashboard/experiments">Experiments</Link>
        <Link href="/dashboard/creative">Creative Studio</Link>
      </nav>

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Demo Mode Active</h2>
        <p>This application is running in demo mode with mock data. No real affiliate accounts or paid APIs are required.</p>
      </div>
    </div>
  );
}