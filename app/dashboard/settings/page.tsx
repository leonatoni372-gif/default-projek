export const metadata = { title: 'Settings — AI Affiliate OS' };

export default function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <div style={{ marginTop: '1rem', maxWidth: '600px' }}>
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>AI Provider Configuration</h3>
          <p>Configure your AI provider settings below.</p>
          <label style={{ display: 'block', marginTop: '0.5rem' }}>
            Provider:
            <select style={{ marginLeft: '1rem', padding: '0.25rem' }}>
              <option>openai-compatible</option>
              <option>mock-demo</option>
            </select>
          </label>
          <label style={{ display: 'block', marginTop: '0.5rem' }}>
            Model:
            <input type="text" placeholder="gpt-4" style={{ marginLeft: '1rem', padding: '0.25rem' }} />
          </label>
        </div>

        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Approval Settings</h3>
          <label style={{ display: 'block' }}>
            <input type="checkbox" defaultChecked /> Require human approval before publishing
          </label>
          <label style={{ display: 'block', marginTop: '0.5rem' }}>
            <input type="checkbox" defaultChecked /> Require human approval before spending
          </label>
        </div>

        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3>Demo Mode</h3>
          <p>Demo mode is currently active. All data is mock data.</p>
        </div>
      </div>
    </div>
  );
}