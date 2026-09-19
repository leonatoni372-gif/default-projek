import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — AI Affiliate OS',
  description: 'Command center for AI Affiliate OS',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', background: '#1a1a2e', color: 'white', padding: '1rem' }}>
        <nav>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>🤖 AI Affiliate OS</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {['Overview', 'Products', 'Content', 'Creative', 'Finance', 'Analytics', 'Experiments', 'Agents', 'Settings'].map(item => (
              <li key={item} style={{ marginBottom: '0.5rem' }}>
                <a href={`/dashboard${item === 'Overview' ? '' : `/${item.toLowerCase()}`}`} style={{ color: '#ccc', textDecoration: 'none' }}>
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
}