import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsPoint, DistributionPoint } from "../api/types";
import { GlassPanel } from "./ui";

export function ChartFrame({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {action}
      </div>
      <div className="h-72 w-full">{children}</div>
    </GlassPanel>
  );
}

const tooltipStyle = {
  background: "rgba(2,6,23,0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "16px",
  color: "#f8fafc",
};

export function AreaTrend({ data, dataKey = "carbon" }: { data: AnalyticsPoint[]; dataKey?: keyof AnalyticsPoint }) {
  return (
    <ResponsiveContainer>
      <AreaChart data={data} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
        <defs>
          <linearGradient id="areaEco" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34d399" stopOpacity={0.7} />
            <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
        <XAxis dataKey="label" stroke="#94a3b8" axisLine={false} tickLine={false} />
        <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area type="monotone" dataKey={dataKey as string} stroke="#34d399" fill="url(#areaEco)" strokeWidth={3} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function BarTrend({ data }: { data: AnalyticsPoint[] }) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
        <XAxis dataKey="label" stroke="#94a3b8" axisLine={false} tickLine={false} />
        <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="scans" radius={[12, 12, 0, 0]} fill="#22d3ee" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function LineTrend({ data }: { data: AnalyticsPoint[] }) {
  return (
    <ResponsiveContainer>
      <LineChart data={data} margin={{ left: -18, right: 8, top: 10, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
        <XAxis dataKey="label" stroke="#94a3b8" axisLine={false} tickLine={false} />
        <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Line type="monotone" dataKey="points" stroke="#a78bfa" strokeWidth={3} dot={{ r: 4, fill: "#a78bfa" }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WastePie({ data }: { data: DistributionPoint[] }) {
  return (
    <ResponsiveContainer>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={3}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}