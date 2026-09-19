'use client';
import { useState } from 'react';

const agentNames = ['CEO / Orchestrator', 'Trend Agent', 'Product Research', 'Product Scoring', 'Finance Agent', 'Content Agent', 'Creative Agent', 'Compliance Agent', 'Evaluator', 'Experiment', 'Memory'];

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div>
      <h1>Agents</h1>
      <p>Monitor agent runs, errors, latency, and token/cost data.</p>
      
      <div style={{ marginTop: '1rem' }}>
        {agentNames.map(name => (
          <div
            key={name}
            onClick={() => setSelectedAgent(selectedAgent === name ? null : name)}
            style={{
              padding: '1rem',
              marginBottom: '0.5rem',
              background: selectedAgent === name ? '#e8f4fd' : '#f5f5f5',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <h3>{name}</h3>
            <p>Status: <span style={{ color: 'green' }}>●</span> Available</p>
            {selectedAgent === name && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                <p>Runs: {Math.floor(Math.random() * 100)}</p>
                <p>Avg Latency: {Math.floor(Math.random() * 500)}ms</p>
                <p>Token Usage: {Math.floor(Math.random() * 10000)}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}