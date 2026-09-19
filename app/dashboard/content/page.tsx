export const metadata = { title: 'Content — AI Affiliate OS' };

const stages = ['IDEA', 'SCRIPT', 'CREATIVE_BRIEF', 'COMPLIANCE_REVIEW', 'HUMAN_APPROVAL', 'SCHEDULED', 'PUBLISHED', 'EVALUATED'];

export default function ContentPage() {
  return (
    <div>
      <h1>Content Pipeline</h1>
      <p>IDEA → SCRIPT → CREATIVE_BRIEF → COMPLIANCE_REVIEW → HUMAN_APPROVAL → SCHEDULED → PUBLISHED → EVALUATED</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem', marginTop: '1rem' }}>
        {stages.map((s) => (
          <div key={s} style={{ padding: '0.75rem', background: '#f5f5f5', borderRadius: '8px', fontSize: '0.8rem' }}>
            <strong>{s}</strong>
            <p style={{ color: '#666' }}>0 items (demo)</p>
          </div>
        ))}
      </div>
      <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff4f4', borderRadius: '8px' }}>
        <p>⚠️ Blocked content cannot enter publishing state. Human approval required.</p>
      </div>
    </div>
  );
}
