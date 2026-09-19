export const metadata = { title: 'Products — AI Affiliate OS' };

export default function ProductsPage() {
  return (
    <div>
      <h1>Products</h1>
      <p>Searchable product table with scores, commission rates, and historical performance.</p>
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Score</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Commission</th>
              <th style={{ padding: '0.5rem', textAlign: 'left' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: 'AI Affiliate Masterclass', score: 0.85, commission: '30%', status: 'Active' },
              { name: 'Smart Content Tool', score: 0.72, commission: '20%', status: 'Active' },
              { name: 'Analytics Dashboard Pro', score: 0.68, commission: '25%', status: 'Active' },
            ].map((product, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{product.name}</td>
                <td style={{ padding: '0.5rem' }}>{product.score}</td>
                <td style={{ padding: '0.5rem' }}>{product.commission}</td>
                <td style={{ padding: '0.5rem' }}>{product.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}