import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface PopularityData {
  eventId: string;
  title: string;
  registrationCount: number;
}

interface EventPopularityChartProps {
  data: PopularityData[];
}

export default function EventPopularityChart({ data }: EventPopularityChartProps) {
  const chartData = data.map(item => ({
    name: item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title,
    registrations: item.registrationCount,
    fullTitle: item.title,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="cyber-border rounded-lg p-3 bg-background shadow-lg">
          <p className="font-medium text-foreground">{data.fullTitle}</p>
          <p className="text-primary">
            <span className="font-medium">{payload[0].value}</span> registrations
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg chart-grid" data-testid="no-popularity-data">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-muted-foreground">No event data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full" data-testid="event-popularity-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 18%)" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(240, 5%, 64%)" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="hsl(240, 5%, 64%)" 
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="registrations" 
            fill="hsl(195, 100%, 50%)"
            name="Registrations"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
