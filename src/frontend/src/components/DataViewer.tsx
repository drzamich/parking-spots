import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface DataViewerProps {
  onLogout: () => void;
}

interface ParkingData {
  id: number;
  location: string;
  free_spots: number;
  timestamp: string;
}

export const DataViewer: React.FC<DataViewerProps> = ({ onLogout }) => {
  const [data, setData] = useState<ParkingData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [location, setLocation] = useState('krasinski');
  
  // Default range: last 24 hours
  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setHours(date.getHours() - 24);
    return date.toISOString().slice(0, 16);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 16));

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ 
        location, 
        from: new Date(from).toISOString(), 
        to: new Date(to).toISOString() 
      });
      const response = await fetch(`/api/getdata?${params.toString()}`);
      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) onLogout();
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }
      
      // Sort data by timestamp ascending for the chart
      const sortedData = (result as ParkingData[]).sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      setData(sortedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [location, from, to, onLogout]);

  // Automatically fetch when parameters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTooltip = (value: any) => [`${value} spots`, 'Free Spots'];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Parking Spot Data</h1>
        <button onClick={onLogout}>Logout</button>
      </div>
      
      <div style={{ 
        marginBottom: '30px', 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '15px', 
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="krasinski">Krasiński</option>
            <option value="warynskiego">Waryńskiego</option>
          </select>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>From</label>
          <input 
            type="datetime-local" 
            value={from} 
            onChange={(e) => setFrom(e.target.value)} 
          />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>To</label>
          <input 
            type="datetime-local" 
            value={to} 
            onChange={(e) => setTo(e.target.value)} 
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button onClick={fetchData} disabled={loading} style={{ height: 'fit-content' }}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px' }}>Error: {error}</div>}
      
      <div style={{ width: '100%', height: '400px', backgroundColor: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatXAxis}
                minTickGap={30}
              />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip 
                labelFormatter={(label) => new Date(label).toLocaleString()}
                formatter={formatTooltip}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="free_spots" 
                name="Free Spots"
                stroke="#007bff" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666' }}>
            {loading ? 'Loading chart data...' : 'No data available for the selected range.'}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        Found {data.length} records.
      </div>
    </div>
  );
};
