import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface RiskGaugeProps {
  risk: number;
  title: string;
}

const RiskGauge = ({ risk, title }: RiskGaugeProps) => {
  const data = [
    { name: "Risk", value: risk },
    { name: "Safe", value: 100 - risk },
  ];

  const getColor = (risk: number): string => {
    if (risk < 30) return "hsl(var(--accent))";
    if (risk < 60) return "hsl(var(--warning))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="space-y-2">
      <h4 className="text-center font-semibold text-lg">{title}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={getColor(risk)} />
            <Cell fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-3xl font-bold text-primary">{risk}%</p>
    </div>
  );
};

export default RiskGauge;
