import { useQuery } from "@tanstack/react-query";
import { Line, LineChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Building2, FolderKanban, Landmark, UserSquare2, Users, CalendarClock, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { StatsCard } from "@/components/ui/StatsCard";
import { ChartCard } from "@/components/ui/ChartCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

interface DashboardData {
  cards: {
    totalProperties: number;
    activeProperties: number;
    totalProjects: number;
    totalBuilders?: number;
    totalAgents?: number;
    newLeads: number;
    upcomingSiteVisitsCount: number;
  };
  charts: {
    leadsOverTime: { date: string; count: number }[];
    propertyInventoryByStatus: { status: string; count: number }[];
    agentPerformance: { agentId: string; agentName: string; leadCount: number }[];
  };
  recentActivity: {
    newLeads: { id: string; name: string; phone: string; status: string; source: string; createdAt: string }[];
    upcomingSiteVisits: {
      id: string;
      name: string;
      preferredDate: string;
      preferredTime: string;
      status: string;
      property?: { title: string } | null;
      project?: { name: string } | null;
    }[];
    recentProperties: { id: string; title: string; status: string; publishStatus: string; location?: { name: string } }[];
  };
}

export function DashboardPage() {
  const { user } = useAuth();
  const isStaff = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await apiClient.get<{ data: DashboardData }>("/admin/dashboard")).data.data,
  });

  if (isLoading || !data) {
    return <p className="text-sm text-text-muted">Loading dashboard...</p>;
  }

  const { cards, charts, recentActivity } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-navy">Dashboard</h1>
        <p className="text-sm text-text-secondary">
          {isStaff ? "Overview across the whole platform." : "Overview of your assigned properties, projects, and leads."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatsCard label="Total Properties" value={cards.totalProperties} icon={Building2} />
        <StatsCard label="Active Properties" value={cards.activeProperties} icon={CheckCircle2} />
        <StatsCard label="Projects" value={cards.totalProjects} icon={FolderKanban} />
        {isStaff && cards.totalBuilders !== undefined && <StatsCard label="Builders" value={cards.totalBuilders} icon={Landmark} />}
        {isStaff && cards.totalAgents !== undefined && <StatsCard label="Agents" value={cards.totalAgents} icon={UserSquare2} />}
        <StatsCard label="New Leads" value={cards.newLeads} icon={Users} />
        <StatsCard label="Upcoming Site Visits" value={cards.upcomingSiteVisitsCount} icon={CalendarClock} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Leads Over Time (30 days)">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={charts.leadsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0B2346" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Property Inventory by Status">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.propertyInventoryByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E3" />
              <XAxis dataKey="status" tick={{ fontSize: 10 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#C59A4A" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {isStaff && charts.agentPerformance.length > 0 && (
          <ChartCard title="Agent Performance (leads assigned)">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={charts.agentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E7E3" />
                <XAxis dataKey="agentName" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="leadCount" fill="#193F78" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">New Leads</h3>
          <ul className="space-y-3">
            {recentActivity.newLeads.length === 0 && <li className="text-sm text-text-muted">No leads yet.</li>}
            {recentActivity.newLeads.map((lead) => (
              <li key={lead.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-text-primary">{lead.name}</p>
                  <p className="text-xs text-text-muted">{lead.phone}</p>
                </div>
                <StatusBadge status={lead.status} />
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Upcoming Site Visits</h3>
          <ul className="space-y-3">
            {recentActivity.upcomingSiteVisits.length === 0 && <li className="text-sm text-text-muted">Nothing scheduled.</li>}
            {recentActivity.upcomingSiteVisits.map((visit) => (
              <li key={visit.id} className="text-sm">
                <p className="font-medium text-text-primary">{visit.name}</p>
                <p className="text-xs text-text-muted">
                  {visit.property?.title ?? visit.project?.name} &middot;{" "}
                  {new Date(visit.preferredDate).toLocaleDateString()} {visit.preferredTime}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-text-primary">Recently Added Properties</h3>
          <ul className="space-y-3">
            {recentActivity.recentProperties.length === 0 && <li className="text-sm text-text-muted">No properties yet.</li>}
            {recentActivity.recentProperties.map((property) => (
              <li key={property.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-text-primary">{property.title}</p>
                  <p className="text-xs text-text-muted">{property.location?.name}</p>
                </div>
                <StatusBadge status={property.publishStatus} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
