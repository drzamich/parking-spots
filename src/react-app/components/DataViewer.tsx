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

interface ChartDataPoint {
  timestamp: string;
  [key: string]: string | number;
}

const LOCATIONS = [
  { id: 'krasinski', label: 'Krasiński' },
  { id: 'warynskiego', label: 'Waryńskiego' }
];

const COLORS = {
  krasinski: '#007bff',
  warynskiego: '#28a745'
};

export const DataViewer: React.FC<DataViewerProps> = ({ onLogout }) => {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(['krasinski']);

  const [from, setFrom] = useState(() => {
    const date = new Date();
    date.setHours(date.getHours() - 24);
    return date.toISOString().slice(0, 16);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 16));

  const toggleLocation = (locationId: string) => {
    setSelectedLocations(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId) 
        : [...prev, locationId]
    );
  };

  const fetchData = useCallback(async () => {
    if (selectedLocations.length === 0) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ 
        location: selectedLocations.join(','), 
        from: new Date(from).toISOString(), 
        to: new Date(to).toISOString() 
      });
      const response = await fetch(`/api/getdata?${params.toString()}`);
      const result = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) onLogout();
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }
      
      const rawData = result as ParkingData[];
      
      // Group by timestamp to display multiple lines
      const groupedData: Record<string, ChartDataPoint> = {};
      
      rawData.forEach(item => {
        // Use a 5-minute bucket or similar if timestamps don't align perfectly, 
        // but for now, let's assume they align from the scraper.
        const ts = item.timestamp;
        if (!groupedData[ts]) {
          groupedData[ts] = { timestamp: ts };
        }
        groupedData[ts][item.location] = item.free_spots;
      });

      const chartData = Object.values(groupedData).sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      setData(chartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedLocations, from, to, onLogout]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatXAxis = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTooltip = (value: any) => [`${value} spots`, ''];

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
        gap: '20px', 
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Locations</label>
          <div style={{ display: 'flex', gap: '10px', paddingTop: '5px' }}>
            {LOCATIONS.map(loc => (
              <label key={loc.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={selectedLocations.includes(loc.id)} 
                  onChange={() => toggleLocation(loc.id)} 
                />
                {loc.label}
              </label>
            ))}
          </div>
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
              {selectedLocations.map(locId => (
                <Line 
                  key={locId}
                  type="monotone" 
                  dataKey={locId} 
                  name={LOCATIONS.find(l => l.id === locId)?.label}
                  stroke={COLORS[locId as keyof typeof COLORS]} 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                  animationDuration={500}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#666' }}>
            {loading ? 'Loading chart data...' : 'No data available for the selected locations and range.'}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        Found data points for {selectedLocations.length} locations.
      </div>
    </div>
  );
};
