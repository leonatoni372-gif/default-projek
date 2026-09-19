export const metadata = { title: 'Experiments — AI Affiliate OS' };

export default function ExperimentsPage() {
  return (
    <div>
      <h1>Experiments</h1>
      <div style={{ marginTop: '1rem' }}>
        {[
          { name: 'Hook A/B Test', type: 'hook', status: 'running', confidence: 0.72 },
          { name: 'CTA A/B Test', type: 'CTA', status: 'completed', confidence: 0.85 },
          { name: 'Format A/B Test', type: 'format', status: 'proposed', confidence: 0.0 },
          { name: 'Duration A/B Test', type: 'duration', status: 'running', confidence: 0.45 },
        ].map((exp, i) => (
          <div key={i} style={{ padding: '1rem', marginBottom: '0.5rem', background: '#f5f5f5', borderRadius: '8px' }}>
            <h3>{exp.name}</h3>
            <p>Type: {exp.type} | Status: {exp.status} | Confidence: {exp.confidence}</p>
          </div>
        ))}

        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f4ff', borderRadius: '8px' }}>
          <h3>⚠️ Note</h3>
          <p>Do not call a result causal unless the experimental design justifies it.</p>
        </div>
      </div>
    </div>
  );
}