import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

interface PopularityData {
  eventId: string;
  title: string;
  registrationCount: number;
}

interface AttendanceChartProps {
  data: PopularityData[];
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  // Transform the data for pie chart visualization
  const chartData = data.slice(0, 6).map((item, index) => ({
    name: item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title,
    value: item.registrationCount,
    fullTitle: item.title,
    color: `hsl(${180 + (index * 40)}, 70%, ${50 + (index * 8)}%)`, // Generate different colors
  }));

  const COLORS = [
    'hsl(195, 100%, 50%)', // primary
    'hsl(260, 70%, 60%)',  // secondary  
    'hsl(142, 100%, 50%)', // accent
    'hsl(42, 93%, 56%)',   // chart-4
    'hsl(341, 75%, 51%)',  // chart-5
    'hsl(280, 80%, 60%)',  // purple
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="cyber-border rounded-lg p-3 bg-background shadow-lg">
          <p className="font-medium text-foreground">{data.fullTitle}</p>
          <p className="text-primary">
            <span className="font-medium">{data.value}</span> registrations
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg chart-grid" data-testid="no-attendance-data">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p className="text-muted-foreground">No attendance data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full" data-testid="attendance-chart">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke="hsl(240, 10%, 4%)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              fontSize: '12px',
              color: 'hsl(240, 5%, 64%)'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
