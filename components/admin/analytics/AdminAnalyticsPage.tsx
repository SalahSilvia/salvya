"use client";

import { useEffect, useMemo, useState } from "react";
import { funnelCountsFromApi, type FunnelStageGroup } from "@/lib/analytics/funnel-stages";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StatsPayload = {
  kpis: {
    revenue30d: number;
    totalOrders: number;
    conversionRate: number;
  };
  charts: {
    salesOverTime: { date: string; revenue: number }[];
    ordersPerDay: { date: string; orders: number }[];
    topProducts: { title: string; cents: number }[];
    topArtists: { slug: string; cents: number }[];
  };
};

type OverviewData = {
  since: string;
  visitorsDistinctSessions: number;
  sessionsStarted: number;
  totalEvents: number;
  eventsByType: Record<string, number>;
  avgSessionMinutes: number;
};

type FunnelData = {
  since: string;
  funnel: Record<string, number>;
};

type ActivityPayload = {
  liveUsers: number;
  recentOrders: { orderNumber: string; buyerEmail: string; total: number; createdAt: string }[];
  newSignups: { userId: string; role: string; createdAt: string }[];
};

type TrafficData = {
  since: string;
  totalSessions: number;
  bySource: { label: string; sessions: number; pct: number }[];
  byMedium: { label: string; sessions: number; pct: number }[];
  byCampaign: { label: string; sessions: number; pct: number }[];
  byReferrer: { label: string; sessions: number; pct: number }[];
};

const DAYS = 30;

function TrafficTable({ title, rows }: { title: string; rows: TrafficData["bySource"] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d7175]">{title}</p>
      <ul className="mt-2 divide-y divide-[#e3e5e7]">
        {rows.length ? (
          rows.map((r) => (
            <li key={r.label} className="flex items-center justify-between gap-2 py-2 text-[13px]">
              <span className="min-w-0 truncate font-medium text-[#202223]">{r.label}</span>
              <span className="shrink-0 tabular-nums text-[#6d7175]">
                {r.sessions} <span className="text-[#8c9196]">({r.pct}%)</span>
              </span>
            </li>
          ))
        ) : (
          <li className="py-4 text-[13px] text-[#6d7175]">No sessions in range.</li>
        )}
      </ul>
    </div>
  );
}

export function AdminAnalyticsPage() {
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [liveUsers, setLiveUsers] = useState<number | null>(null);
  const [activity, setActivity] = useState<ActivityPayload | null>(null);
  const [topProducts, setTopProducts] = useState<{ product_id: string; views: number }[]>([]);
  const [topArtists, setTopArtists] = useState<{ artist_slug: string; score: number }[]>([]);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [traffic, setTraffic] = useState<TrafficData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const q = `days=${DAYS}&limit=10`;
    (async () => {
      setLoadError(null);
      try {
        const [rStats, rOverview, rLive, rTp, rTa, rFn, rAct, rTraffic] = await Promise.all([
          fetch("/api/admin/stats", { credentials: "include", cache: "no-store" }),
          fetch(`/api/admin/analytics/overview?${q}`, { credentials: "include", cache: "no-store" }),
          fetch("/api/admin/analytics/live-users", { credentials: "include", cache: "no-store" }),
          fetch(`/api/admin/analytics/top-products?${q}`, { credentials: "include", cache: "no-store" }),
          fetch(`/api/admin/analytics/top-artists?${q}`, { credentials: "include", cache: "no-store" }),
          fetch(`/api/admin/analytics/conversion-funnel?${q}`, { credentials: "include", cache: "no-store" }),
          fetch("/api/admin/activity", { credentials: "include", cache: "no-store" }),
          fetch(`/api/admin/analytics/traffic?days=${DAYS}`, { credentials: "include", cache: "no-store" }),
        ]);

        const [bStats, bOverview, bLive, bTp, bTa, bFn, bAct, bTraffic] = await Promise.all([
          rStats.json() as Promise<{ ok?: boolean } & Partial<StatsPayload>>,
          rOverview.json() as Promise<{ ok?: boolean; data?: OverviewData }>,
          rLive.json() as Promise<{ ok?: boolean; data?: { liveUsers: number } }>,
          rTp.json() as Promise<{ ok?: boolean; items?: { product_id: string; views: number }[] }>,
          rTa.json() as Promise<{ ok?: boolean; items?: { artist_slug: string; score: number }[] }>,
          rFn.json() as Promise<{ ok?: boolean; data?: FunnelData }>,
          rAct.json() as Promise<{
            ok?: boolean;
            liveUsers?: number;
            recentOrders?: ActivityPayload["recentOrders"];
            newSignups?: ActivityPayload["newSignups"];
          }>,
          rTraffic.json() as Promise<{ ok?: boolean; data?: TrafficData }>,
        ]);

        if (cancelled) return;

        if (rStats.ok && bStats.ok && bStats.kpis && bStats.charts) {
          setStats({ kpis: bStats.kpis, charts: bStats.charts });
        }
        if (rOverview.ok && bOverview.ok && bOverview.data) setOverview(bOverview.data);
        else if (rOverview.ok === false) setOverview(null);

        if (rLive.ok && bLive.ok && bLive.data) setLiveUsers(bLive.data.liveUsers);
        else setLiveUsers(null);

        if (rTp.ok && bTp.ok && Array.isArray(bTp.items)) setTopProducts(bTp.items);
        else setTopProducts([]);

        if (rTa.ok && bTa.ok && Array.isArray(bTa.items)) setTopArtists(bTa.items);
        else setTopArtists([]);

        if (rFn.ok && bFn.ok && bFn.data) setFunnel(bFn.data);
        if (rTraffic.ok && bTraffic.ok && bTraffic.data) setTraffic(bTraffic.data);
        else setFunnel(null);

        if (rAct.ok && bAct.ok && typeof bAct.liveUsers === "number" && Array.isArray(bAct.recentOrders) && Array.isArray(bAct.newSignups)) {
          setActivity({
            liveUsers: bAct.liveUsers,
            recentOrders: bAct.recentOrders,
            newSignups: bAct.newSignups,
          });
        } else {
          setActivity(null);
        }

        if (!rOverview.ok && bOverview.ok === false && !cancelled) {
          setLoadError("Analytics overview unavailable (check migration + admin session).");
        }
      } catch (e) {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : "load_failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chartData = stats?.charts.salesOverTime.slice(-21) ?? [];
  const ordersTrend = stats?.charts.ordersPerDay.slice(-21) ?? [];

  const aov =
    stats && stats.kpis.totalOrders > 0 ? Math.round((stats.kpis.revenue30d / stats.kpis.totalOrders) * 100) / 100 : null;

  const funnelByGroup = useMemo(() => {
    if (!funnel) return null;
    const base = Math.max(1, funnel.funnel.page_view ?? 0);
    const rows = funnelCountsFromApi(funnel.funnel).map((s) => ({
      ...s,
      pctOfTop: Math.round((s.count / base) * 1000) / 10,
    }));
    const groups: FunnelStageGroup[] = ["core", "commerce", "discovery", "engagement"];
    return Object.fromEntries(
      groups.map((g) => [g, rows.filter((r) => r.group === g)]),
    ) as Record<FunnelStageGroup, typeof rows>;
  }, [funnel]);

  const funnelGroupLabels: Record<FunnelStageGroup, string> = {
    core: "Core funnel",
    commerce: "Commerce",
    discovery: "Discovery",
    engagement: "Engagement",
  };

  const productBarData = topProducts.slice(0, 8).map((p) => ({
    label: p.product_id.length > 28 ? `${p.product_id.slice(0, 26)}…` : p.product_id,
    views: p.views,
  }));

  const artistBarData = topArtists.slice(0, 8).map((a) => ({
    label: a.artist_slug,
    score: a.score,
  }));

  return (
    <div className="space-y-10">
      {loadError ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          {loadError} Ensure the analytics migration is applied in Supabase and you are signed in as admin.
        </p>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-[#e3e5e7] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d7175]">Visitors (30d)</p>
          <p className="mt-2 text-[1.65rem] font-semibold tabular-nums text-[#202223]">
            {overview?.visitorsDistinctSessions ?? "—"}
          </p>
          <p className="mt-1 text-[12px] text-[#6d7175]">Distinct sessions with events</p>
        </div>
        <div className="rounded-xl border border-[#e3e5e7] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d7175]">Live now</p>
          <p className="mt-2 text-[1.65rem] font-semibold tabular-nums text-emerald-700">{liveUsers ?? "—"}</p>
          <p className="mt-1 text-[12px] text-[#6d7175]">Sessions seen in the last 2 minutes</p>
        </div>
        <div className="rounded-xl border border-[#e3e5e7] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d7175]">Avg. session</p>
          <p className="mt-2 text-[1.65rem] font-semibold tabular-nums text-[#202223]">
            {overview != null ? `${overview.avgSessionMinutes} min` : "—"}
          </p>
          <p className="mt-1 text-[12px] text-[#6d7175]">From started_at → last_seen_at</p>
        </div>
        <div className="rounded-xl border border-[#e3e5e7] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d7175]">Revenue (30d)</p>
          <p className="mt-2 text-[1.65rem] font-semibold tabular-nums text-[#202223]">
            {stats ? `€${Math.round(stats.kpis.revenue30d)}` : "—"}
          </p>
          <p className="mt-1 text-[12px] text-[#6d7175]">Paid pipeline from orders</p>
        </div>
        <div className="rounded-xl border border-[#e3e5e7] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d7175]">Orders (all-time)</p>
          <p className="mt-2 text-[1.65rem] font-semibold tabular-nums text-[#202223]">{stats?.kpis.totalOrders ?? "—"}</p>
          <p className="mt-1 text-[12px] text-[#6d7175]">Recorded in customer_orders</p>
        </div>
        <div className="rounded-xl border border-[#e3e5e7] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d7175]">Conversion</p>
          <p className="mt-2 text-[1.65rem] font-semibold tabular-nums text-[#202223]">
            {stats ? `${stats.kpis.conversionRate}%` : "—"}
          </p>
          <p className="mt-1 text-[12px] text-[#6d7175]">Paid ÷ sampled orders (stats)</p>
        </div>
        <div className="rounded-xl border border-[#e3e5e7] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d7175]">Avg. order value</p>
          <p className="mt-2 text-[1.65rem] font-semibold tabular-nums text-emerald-700">{aov != null ? `€${aov}` : "—"}</p>
          <p className="mt-1 text-[12px] text-[#6d7175]">Revenue 30d ÷ orders (est.)</p>
        </div>
        <div className="rounded-xl border border-[#e3e5e7] bg-white p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d7175]">Page views (30d)</p>
          <p className="mt-2 text-[1.65rem] font-semibold tabular-nums text-[#202223]">
            {overview?.eventsByType?.page_view ?? "—"}
          </p>
          <p className="mt-1 text-[12px] text-[#6d7175]">First-party analytics volume</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#e3e5e7] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#202223]">Live pulse</p>
          <p className="mt-1 text-[12px] text-[#6d7175]">Activity feed from orders + signups + analytics heartbeat.</p>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-[#e3e5e7] bg-[#fafbfb] px-4 py-3">
              <span className="text-[13px] text-[#6d7175]">Pulse visitors (60s window)</span>
              <span className="text-lg font-semibold tabular-nums text-emerald-700">
                {activity?.liveUsers ?? liveUsers ?? "—"}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d7175]">Recent purchases</p>
              <ul className="mt-2 max-h-[200px] space-y-2 overflow-y-auto">
                {(activity?.recentOrders ?? []).map((o) => (
                  <li
                    key={`${o.orderNumber}-${o.createdAt}`}
                    className="flex justify-between gap-3 rounded-lg border border-[#e3e5e7] bg-white px-3 py-2 text-[12px]"
                  >
                    <span className="min-w-0 truncate font-mono text-[#2D6BFF]">{o.orderNumber}</span>
                    <span className="shrink-0 text-emerald-700">€{o.total}</span>
                  </li>
                ))}
                {!activity?.recentOrders?.length ? (
                  <li className="text-[12px] text-[#6d7175]">No recent orders loaded.</li>
                ) : null}
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6d7175]">New profiles</p>
              <ul className="mt-2 max-h-[160px] space-y-2 overflow-y-auto">
                {(activity?.newSignups ?? []).map((s) => (
                  <li key={s.userId} className="rounded-lg border border-[#e3e5e7] bg-white px-3 py-2 text-[12px] text-[#202223]">
                    <span className="font-mono text-[11px] text-[#6d7175]">{s.userId.slice(0, 8)}…</span>
                    <span className="mx-2 text-[#8c9196]">·</span>
                    {s.role}
                    <span className="ml-2 text-[#6d7175]">{new Date(s.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
                {!activity?.newSignups?.length ? (
                  <li className="text-[12px] text-[#6d7175]">No recent signups.</li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#e3e5e7] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#202223]">Orders per day</p>
          <p className="mt-1 text-[12px] text-[#6d7175]">Commercial rhythm from recorded orders (stats).</p>
          <div className="mt-6 h-[260px]">
            {ordersTrend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ordersTrend} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid stroke="rgba(32,34,35,0.08)" strokeDasharray="3 6" />
                  <XAxis dataKey="date" tick={{ fill: "#6d7175", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6d7175", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#12141c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                  />
                  <Line type="monotone" dataKey="orders" stroke="#34d399" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-[13px] text-[#6d7175]">No order volume yet.</div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#e3e5e7] bg-white p-6">
        <p className="text-[13px] font-semibold text-[#202223]">Revenue trajectory</p>
        <p className="mt-1 text-[12px] text-[#6d7175]">Order-based revenue — same source as Overview.</p>
        <div className="mt-6 h-[300px]">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="admRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6f9dff" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#6f9dff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(32,34,35,0.08)" strokeDasharray="3 6" />
                <XAxis dataKey="date" tick={{ fill: "#6d7175", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6d7175", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#12141c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                  formatter={(value) => {
                    const n = typeof value === "number" ? value : Number(value);
                    return [`€${Number.isFinite(n) ? n : 0}`, "Revenue"];
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2D6BFF" fill="url(#admRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-[13px] text-[#6d7175]">No paid orders in range yet.</div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#e3e5e7] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#202223]">Conversion funnel</p>
          <p className="mt-1 text-[12px] text-[#6d7175]">Distinct sessions per stage (first-party events, last {DAYS} days).</p>
          <ul className="mt-6 space-y-4">
            {funnelByGroup ? (
              (["core", "commerce", "discovery", "engagement"] as FunnelStageGroup[]).flatMap((group) => {
                const rows = funnelByGroup[group];
                if (!rows.length) return [];
                return [
                  <li key={`${group}-heading`} className="list-none pt-2 first:pt-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8c9196]">
                      {funnelGroupLabels[group]}
                    </p>
                  </li>,
                  ...rows.map((f, i) => (
                <li key={f.key} className="flex items-center gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e3e5e7] bg-[#f6f6f7] text-[12px] font-semibold text-[#6d7175]">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[14px] font-medium text-[#202223]">{f.label}</p>
                      <span className="tabular-nums text-[13px] text-emerald-700">
                        {f.count} <span className="text-[#6d7175]">({f.pctOfTop}%)</span>
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f6f6f7]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#2D6BFF] to-emerald-400"
                        style={{ width: `${Math.min(100, f.pctOfTop)}%` }}
                      />
                    </div>
                  </div>
                </li>
                  )),
                ];
              })
            ) : (
              <li className="text-[13px] text-[#6d7175]">No funnel data yet — ship events from storefront traffic.</li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-[#e3e5e7] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#202223]">Traffic &amp; attribution</p>
          <p className="mt-1 text-[12px] text-[#6d7175]">
            {traffic
              ? `${traffic.totalSessions} sessions in the last ${DAYS} days`
              : "Sessions grouped by UTM and referrer (first touch on session)."}
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <TrafficTable title="UTM source" rows={traffic?.bySource ?? []} />
            <TrafficTable title="UTM medium" rows={traffic?.byMedium ?? []} />
            <TrafficTable title="UTM campaign" rows={traffic?.byCampaign ?? []} />
            <TrafficTable title="Referrer host" rows={traffic?.byReferrer ?? []} />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[#e3e5e7] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#202223]">Top products by views</p>
          <p className="mt-1 text-[12px] text-[#6d7175]">Product catalog IDs (composite Salvya keys).</p>
          <div className="mt-6 h-[280px]">
            {productBarData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productBarData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid stroke="rgba(32,34,35,0.08)" strokeDasharray="3 6" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#6d7175", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={120}
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ background: "#12141c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                    formatter={(v) => [v, "Views"]}
                  />
                  <Bar dataKey="views" fill="#6f9dff" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-[13px] text-[#6d7175]">No product_view events yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#e3e5e7] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#202223]">Top artists</p>
          <p className="mt-1 text-[12px] text-[#6d7175]">Artist views + product views with artist_slug.</p>
          <div className="mt-6 h-[280px]">
            {artistBarData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={artistBarData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid stroke="rgba(32,34,35,0.08)" strokeDasharray="3 6" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#6d7175", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={100}
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{ background: "#12141c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
                    formatter={(v) => [v, "Score"]}
                  />
                  <Bar dataKey="score" fill="#108043" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-[13px] text-[#6d7175]">No artist signals yet.</div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-[#e3e5e7] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#202223]">Top products by revenue (30d)</p>
          <ul className="mt-4 divide-y divide-[#e3e5e7]">
            {(stats?.charts.topProducts ?? []).slice(0, 6).map((p) => (
              <li key={p.title} className="flex justify-between gap-3 py-3 text-[13px]">
                <span className="min-w-0 truncate text-[#202223]">{p.title}</span>
                <span className="shrink-0 text-emerald-700">€{Math.round(p.cents / 100)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[#e3e5e7] bg-white p-6">
          <p className="text-[13px] font-semibold text-[#202223]">Top artists by revenue</p>
          <ul className="mt-4 divide-y divide-[#e3e5e7]">
            {(stats?.charts.topArtists ?? []).slice(0, 6).map((a) => (
              <li key={a.slug} className="flex justify-between gap-3 py-3 text-[13px]">
                <span className="text-[#202223]">{a.slug}</span>
                <span className="text-[#2D6BFF]">€{Math.round(a.cents / 100)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
