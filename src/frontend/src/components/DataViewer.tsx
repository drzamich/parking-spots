import React, { useState } from 'react';

interface DataViewerProps {
  onLogout: () => void;
}

export const DataViewer: React.FC<DataViewerProps> = ({ onLogout }) => {
  const [data, setData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [location, setLocation] = useState('krasinski');
  const [from, setFrom] = useState('2024-01-01T00:00:00');
  const [to, setTo] = useState(new Date().toISOString());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ location, from, to });
      const response = await fetch(`/api/getdata?${params.toString()}`);
      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) onLogout();
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }
      
      setData(JSON.stringify(result, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setData('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Parking Spot Data</h1>
      
      <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value="krasinski">Krasiński</option>
          <option value="warynskiego">Waryńskiego</option>
        </select>
        <input 
          type="datetime-local" 
          value={from.slice(0, 16)} 
          onChange={(e) => setFrom(e.target.value)} 
        />
        <input 
          type="datetime-local" 
          value={to.slice(0, 16)} 
          onChange={(e) => setTo(e.target.value)} 
        />
        <button onClick={fetchData} disabled={loading}>
          {loading ? 'Fetching...' : 'Fetch Data'}
        </button>
        <button onClick={onLogout}>Logout</button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>Error: {error}</div>}
      
      <pre style={{ 
        background: '#f4f4f4', 
        padding: '15px', 
        borderRadius: '5px',
        overflow: 'auto',
        maxHeight: '500px'
      }}>
        {data || 'No data fetched yet.'}
      </pre>
    </div>
  );
};
