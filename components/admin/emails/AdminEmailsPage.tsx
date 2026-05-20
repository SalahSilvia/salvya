"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminKpiCard, AdminPageHeader } from "@/components/admin/admin-ui";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminErrorBox,
  adminInputClass,
  adminMuted,
  adminPanelClass,
  adminTableWrap,
} from "@/components/admin/admin-theme";
import { EMAIL_TEMPLATE_IDS } from "@/lib/email/defaults";
import {
  EMAIL_TEMPLATE_GROUPS,
  getTemplateCategory,
  groupTemplateIds,
  type EmailTemplateGroup,
} from "@/lib/email/template-catalog";
import type { ResendDeliveryStatus } from "@/lib/email/resend-brand";
import { SALVYA_EMAIL_ALIASES } from "@/lib/email/resend-brand";
import type {
  CustomerEmailsBundle,
  CustomerEmailTemplate,
  EmailSendLogRow,
  EmailTemplateCategory,
  EmailTemplateId,
} from "@/lib/email/types";
import { EMAIL_MERGE_TAGS } from "@/lib/email/types";

const STATUS_STYLES: Record<EmailSendLogRow["status"], string> = {
  sent: "bg-emerald-50 text-emerald-800 border-emerald-200",
  queued: "bg-amber-50 text-amber-900 border-amber-200",
  failed: "bg-rose-50 text-rose-800 border-rose-200",
  skipped: "bg-slate-100 text-slate-600 border-slate-200",
};

const CATEGORY_STYLES: Record<
  EmailTemplateCategory,
  { pill: string; dot: string; label: string }
> = {
  order: {
    label: "Order",
    pill: "bg-[#eef4ff] text-[#1a5ae8] border-[#c5d9ff]",
    dot: "bg-[#2D6BFF]",
  },
  lifecycle: {
    label: "Journey",
    pill: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
  },
  account: {
    label: "Account",
    pill: "bg-amber-50 text-amber-900 border-amber-200",
    dot: "bg-amber-500",
  },
  marketing: {
    label: "Marketing",
    pill: "bg-violet-50 text-violet-800 border-violet-200",
    dot: "bg-violet-500",
  },
};

type EditorTab = "content" | "send";

function updateTemplate(
  bundle: CustomerEmailsBundle,
  id: EmailTemplateId,
  patch: Partial<CustomerEmailTemplate>,
): CustomerEmailsBundle {
  return {
    ...bundle,
    templates: {
      ...bundle.templates,
      [id]: { ...bundle.templates[id], ...patch },
    },
  };
}

function matchesQuery(t: CustomerEmailTemplate, q: string): boolean {
  if (!q) return true;
  const hay = `${t.name} ${t.description} ${t.trigger} ${t.id}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

export function AdminEmailsPage() {
  const [bundle, setBundle] = useState<CustomerEmailsBundle | null>(null);
  const [selectedId, setSelectedId] = useState<EmailTemplateId>("order_confirmation");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewBusy, setPreviewBusy] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testBusy, setTestBusy] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const [log, setLog] = useState<EmailSendLogRow[]>([]);
  const [logLoading, setLogLoading] = useState(true);
  const [showGlobal, setShowGlobal] = useState(false);
  const [resend, setResend] = useState<ResendDeliveryStatus | null>(null);
  const [broadcastList, setBroadcastList] = useState("");
  const [broadcastBusy, setBroadcastBusy] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState<string | null>(null);
  const [templateQuery, setTemplateQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<EmailTemplateCategory | "all">("all");
  const [editorTab, setEditorTab] = useState<EditorTab>("content");
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = bundle?.templates[selectedId];
  const templatesByGroup = useMemo(() => groupTemplateIds(EMAIL_TEMPLATE_IDS), []);
  const selectedCategory = selected ? getTemplateCategory(selectedId) : "order";
  const categoryStyle = CATEGORY_STYLES[selectedCategory];

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/emails", { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as {
        ok?: boolean;
        emails?: CustomerEmailsBundle;
        resend?: ResendDeliveryStatus;
        error?: string;
      };
      if (!res.ok || !body.ok || !body.emails) throw new Error(body.error ?? "Failed to load");
      setBundle(body.emails);
      if (body.resend) setResend(body.resend);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLog = useCallback(async () => {
    setLogLoading(true);
    try {
      const res = await fetch("/api/admin/emails/log?limit=50", { credentials: "include", cache: "no-store" });
      const body = (await res.json()) as { ok?: boolean; log?: EmailSendLogRow[] };
      if (res.ok && body.ok && body.log) setLog(body.log);
    } catch {
      /* ignore */
    } finally {
      setLogLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadLog();
  }, [load, loadLog]);

  const refreshPreview = useCallback((emails: CustomerEmailsBundle, templateId: EmailTemplateId) => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(async () => {
      setPreviewBusy(true);
      try {
        const res = await fetch("/api/admin/emails/preview", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails, templateId }),
        });
        const body = (await res.json()) as { ok?: boolean; html?: string; subject?: string };
        if (res.ok && body.ok) {
          setPreviewHtml(body.html ?? "");
          setPreviewSubject(body.subject ?? "");
        }
      } catch {
        /* ignore */
      } finally {
        setPreviewBusy(false);
      }
    }, 400);
  }, []);

  useEffect(() => {
    if (!bundle) return;
    refreshPreview(bundle, selectedId);
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, [bundle, selectedId, refreshPreview]);

  const patchBundle = (next: CustomerEmailsBundle) => {
    setBundle(next);
    setSaveOk(null);
  };

  const patchGlobal = (patch: Partial<CustomerEmailsBundle["global"]>) => {
    if (!bundle) return;
    patchBundle({ ...bundle, global: { ...bundle.global, ...patch } });
  };

  const patchSelected = (patch: Partial<CustomerEmailTemplate>) => {
    if (!bundle) return;
    patchBundle(updateTemplate(bundle, selectedId, patch));
  };

  const insertTag = (tag: string) => {
    if (!bundle || !selected) return;
    patchSelected({ body: `${selected.body}${selected.body.endsWith("\n") ? "" : "\n"}${tag}` });
  };

  const save = async () => {
    if (!bundle) return;
    setSaving(true);
    setError(null);
    setSaveOk(null);
    try {
      const res = await fetch("/api/admin/emails", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: bundle }),
      });
      const body = (await res.json()) as { ok?: boolean; emails?: CustomerEmailsBundle; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Save failed");
      if (body.emails) setBundle(body.emails);
      setSaveOk("All templates saved.");
      void loadLog();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    if (!bundle) return;
    setTestBusy(true);
    setTestMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/emails/test-send", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: bundle, templateId: selectedId, toEmail: testEmail }),
      });
      const body = (await res.json()) as { ok?: boolean; status?: string; detail?: string; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Test send failed");
      setTestMsg(`${body.status ?? "sent"} — ${body.detail ?? "Done"}`);
      void loadLog();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Test send failed");
    } finally {
      setTestBusy(false);
    }
  };

  const sendBroadcast = async () => {
    if (selectedCategory !== "marketing") return;
    const recipients = broadcastList
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));
    if (recipients.length === 0) {
      setError("Add recipient emails (comma or newline separated, max 50).");
      return;
    }
    setBroadcastBusy(true);
    setBroadcastMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/admin/emails/broadcast", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedId, recipients }),
      });
      const body = (await res.json()) as { ok?: boolean; detail?: string; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Broadcast failed");
      setBroadcastMsg(body.detail ?? "Broadcast sent");
      void loadLog();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Broadcast failed");
    } finally {
      setBroadcastBusy(false);
    }
  };

  const enabledCount = useMemo(() => {
    if (!bundle) return 0;
    return EMAIL_TEMPLATE_IDS.filter((id) => bundle.templates[id].enabled).length;
  }, [bundle]);

  const sentLast24h = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return log.filter((r) => r.status === "sent" && new Date(r.createdAt).getTime() >= cutoff).length;
  }, [log]);

  const filteredGroups = useMemo(() => {
    if (!bundle) return [] as { group: EmailTemplateGroup; ids: EmailTemplateId[] }[];
    const q = templateQuery.trim();
    return EMAIL_TEMPLATE_GROUPS.map((group) => {
      if (categoryFilter !== "all" && group.id !== categoryFilter) return { group, ids: [] as EmailTemplateId[] };
      const ids = templatesByGroup[group.id].filter((id) => matchesQuery(bundle.templates[id], q));
      return { group, ids };
    }).filter((g) => g.ids.length > 0);
  }, [bundle, templateQuery, categoryFilter, templatesByGroup]);

  const templateName = useCallback(
    (id: string) => bundle?.templates[id as EmailTemplateId]?.name ?? id,
    [bundle],
  );

  if (loading && !bundle) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Email center" description="Loading templates and delivery settings…" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-[#e3e5e7] bg-[#fafbfb]" />
          ))}
        </div>
      </div>
    );
  }

  if (!bundle || !selected) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Email center" description="Could not load email settings." />
        {error ? <div className={adminErrorBox}>{error}</div> : null}
        <button type="button" onClick={() => void load()} className={adminBtnSecondary}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Email center"
        description="Edit templates, preview messages, and send tests. Order and lifecycle emails fire automatically from store events."
        actions={
          <>
            <button type="button" onClick={() => setShowGlobal((v) => !v)} className={adminBtnSecondary}>
              {showGlobal ? "Hide settings" : "Brand settings"}
            </button>
            <button type="button" onClick={() => void save()} disabled={saving} className={adminBtnPrimary}>
              {saving ? "Saving…" : "Save all"}
            </button>
          </>
        }
      />

      {error ? <div className={adminErrorBox}>{error}</div> : null}
      {saveOk ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13px] text-emerald-900">
          {saveOk}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminKpiCard
          label="Resend"
          value={resend?.configured ? "Live" : "Setup"}
          hint={resend?.configured ? resend.defaultFrom : "Add RESEND_API_KEY"}
          accent={resend?.configured ? "emerald" : "amber"}
        />
        <AdminKpiCard
          label="Templates active"
          value={`${enabledCount}/${EMAIL_TEMPLATE_IDS.length}`}
          hint="Enabled automations & campaigns"
          accent="blue"
        />
        <AdminKpiCard
          label="Automations"
          value={bundle.global.emailsEnabled ? "On" : "Paused"}
          hint={bundle.global.emailsEnabled ? "Customer emails sending" : "Master switch off"}
          accent={bundle.global.emailsEnabled ? "emerald" : "rose"}
        />
        <AdminKpiCard
          label="Sent (24h)"
          value={String(sentLast24h)}
          hint={`${log.length} events in log`}
          accent="violet"
        />
      </div>

      {showGlobal ? (
        <div className={`${adminPanelClass} p-4 sm:p-5`}>
          <p className="text-[14px] font-semibold text-[#202223]">Brand & delivery</p>
          <p className={`mt-1 text-[12px] ${adminMuted}`}>
            From name, reply-to, and accent color apply across all templates.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex items-center gap-3 sm:col-span-2 lg:col-span-3">
              <input
                type="checkbox"
                checked={bundle.global.emailsEnabled}
                onChange={(e) => patchGlobal({ emailsEnabled: e.target.checked })}
                className="h-4 w-4 rounded border-[#c9cccf]"
              />
              <span className="text-[13px] font-semibold text-[#202223]">Send customer emails (master switch)</span>
            </label>
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold text-[#6d7175]">From name</span>
              <input
                className={`${adminInputClass} w-full`}
                value={bundle.global.fromName}
                onChange={(e) => patchGlobal({ fromName: e.target.value })}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold text-[#6d7175]">Default from</span>
              <input
                className={`${adminInputClass} w-full`}
                value={bundle.global.fromEmail}
                onChange={(e) => patchGlobal({ fromEmail: e.target.value })}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold text-[#6d7175]">Reply-to</span>
              <input
                className={`${adminInputClass} w-full`}
                value={bundle.global.replyTo}
                onChange={(e) => patchGlobal({ replyTo: e.target.value })}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold text-[#6d7175]">Support email</span>
              <input
                className={`${adminInputClass} w-full`}
                value={bundle.global.supportEmail}
                onChange={(e) => patchGlobal({ supportEmail: e.target.value })}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[12px] font-semibold text-[#6d7175]">Brand accent</span>
              <input
                type="color"
                className="h-10 w-full cursor-pointer rounded-lg border border-[#c9cccf]"
                value={bundle.global.brandAccent}
                onChange={(e) => patchGlobal({ brandAccent: e.target.value })}
              />
            </label>
          </div>
          {resend ? (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-[#e3e5e7] pt-4">
              {(Object.keys(SALVYA_EMAIL_ALIASES) as (keyof typeof SALVYA_EMAIL_ALIASES)[]).map((key) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e3e5e7] bg-[#fafbfb] px-2.5 py-1 text-[11px]"
                  title={SALVYA_EMAIL_ALIASES[key].purpose}
                >
                  <span className="font-semibold text-[#6d7175]">{SALVYA_EMAIL_ALIASES[key].label}</span>
                  <span className="font-mono text-[#202223]">{SALVYA_EMAIL_ALIASES[key].address}</span>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)_minmax(280px,340px)]">
        <aside className={`${adminPanelClass} flex max-h-[min(85vh,780px)] flex-col overflow-hidden`}>
          <div className="shrink-0 space-y-3 border-b border-[#e3e5e7] p-3">
            <input
              type="search"
              placeholder="Search templates…"
              value={templateQuery}
              onChange={(e) => setTemplateQuery(e.target.value)}
              className={`${adminInputClass} w-full text-[13px]`}
            />
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  categoryFilter === "all"
                    ? "border-[#202223] bg-[#202223] text-white"
                    : "border-[#e3e5e7] bg-white text-[#6d7175] hover:bg-[#f6f6f7]"
                }`}
              >
                All
              </button>
              {EMAIL_TEMPLATE_GROUPS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setCategoryFilter(g.id)}
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    categoryFilter === g.id
                      ? CATEGORY_STYLES[g.id].pill
                      : "border-[#e3e5e7] bg-white text-[#6d7175] hover:bg-[#f6f6f7]"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {filteredGroups.length === 0 ? (
              <p className={`px-2 py-4 text-center text-[12px] ${adminMuted}`}>No templates match.</p>
            ) : null}
            {filteredGroups.map(({ group, ids }) => (
              <div key={group.id} className="mb-3">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#8c9196]">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {ids.map((id) => {
                    const t = bundle.templates[id];
                    const active = id === selectedId;
                    const cat = getTemplateCategory(id);
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedId(id);
                            setEditorTab("content");
                          }}
                          className={`w-full rounded-lg px-2.5 py-2 text-left transition-colors ${
                            active ? "bg-[#2D6BFF]/10 ring-1 ring-[#2D6BFF]/25" : "hover:bg-[#f6f6f7]"
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${CATEGORY_STYLES[cat].dot}`}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-[12px] font-semibold leading-tight text-[#202223]">{t.name}</p>
                              <p className={`mt-0.5 text-[10px] ${active ? "text-[#2D6BFF]" : adminMuted}`}>
                                {t.enabled ? "Active" : "Off"}
                              </p>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <section className={`${adminPanelClass} flex flex-col overflow-hidden`}>
          <div className="shrink-0 border-b border-[#e3e5e7] px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[17px] font-semibold text-[#202223]">{selected.name}</h2>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${categoryStyle.pill}`}
                  >
                    {categoryStyle.label}
                  </span>
                </div>
                <p className={`mt-1 text-[13px] leading-snug ${adminMuted}`}>{selected.description}</p>
                <p className="mt-2 text-[11px] font-medium text-[#2D6BFF]">{selected.trigger}</p>
                {resend?.templateSenders[selectedId] ? (
                  <p className={`mt-1 text-[11px] font-mono ${adminMuted}`}>
                    From {resend.templateSenders[selectedId].from}
                  </p>
                ) : null}
              </div>
              <label className="flex items-center gap-2 rounded-lg border border-[#e3e5e7] bg-[#fafbfb] px-3 py-2">
                <input
                  type="checkbox"
                  checked={selected.enabled}
                  onChange={(e) => patchSelected({ enabled: e.target.checked })}
                  className="h-4 w-4"
                />
                <span className="text-[12px] font-semibold">Enabled</span>
              </label>
            </div>
            <div className="mt-4 flex gap-1 rounded-lg bg-[#f6f6f7] p-1">
              {(
                [
                  ["content", "Content"],
                  ["send", "Test & send"],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setEditorTab(tab)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                    editorTab === tab ? "bg-white text-[#202223] shadow-sm" : "text-[#6d7175] hover:text-[#202223]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {editorTab === "content" ? (
              <div className="space-y-4">
                <label className="block space-y-1">
                  <span className="text-[12px] font-semibold text-[#6d7175]">Subject</span>
                  <input
                    className={`${adminInputClass} w-full`}
                    value={selected.subject}
                    onChange={(e) => patchSelected({ subject: e.target.value })}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[12px] font-semibold text-[#6d7175]">Inbox preview line</span>
                  <input
                    className={`${adminInputClass} w-full`}
                    value={selected.previewText}
                    onChange={(e) => patchSelected({ previewText: e.target.value })}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[12px] font-semibold text-[#6d7175]">Headline</span>
                  <input
                    className={`${adminInputClass} w-full`}
                    value={selected.headline}
                    onChange={(e) => patchSelected({ headline: e.target.value })}
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-[12px] font-semibold text-[#6d7175]">Body</span>
                  <textarea
                    className={`${adminInputClass} min-h-[160px] w-full resize-y py-2 font-mono text-[13px]`}
                    value={selected.body}
                    onChange={(e) => patchSelected({ body: e.target.value })}
                  />
                  <span className={`text-[11px] ${adminMuted}`}>Markdown: **bold**, blank line = paragraph</span>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block space-y-1">
                    <span className="text-[12px] font-semibold text-[#6d7175]">Button label</span>
                    <input
                      className={`${adminInputClass} w-full`}
                      value={selected.ctaLabel}
                      onChange={(e) => patchSelected({ ctaLabel: e.target.value })}
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-[12px] font-semibold text-[#6d7175]">Button URL</span>
                    <input
                      className={`${adminInputClass} w-full`}
                      value={selected.ctaUrl}
                      onChange={(e) => patchSelected({ ctaUrl: e.target.value })}
                    />
                  </label>
                </div>
                <label className="block space-y-1">
                  <span className="text-[12px] font-semibold text-[#6d7175]">Footer</span>
                  <input
                    className={`${adminInputClass} w-full`}
                    value={selected.footerNote}
                    onChange={(e) => patchSelected({ footerNote: e.target.value })}
                  />
                </label>
                <div>
                  <p className="text-[12px] font-semibold text-[#6d7175]">Merge tags</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {EMAIL_MERGE_TAGS.map(({ tag, desc }) => (
                      <button
                        key={tag}
                        type="button"
                        title={desc}
                        onClick={() => insertTag(tag)}
                        className="rounded-md border border-[#e3e5e7] bg-[#fafbfb] px-2 py-1 text-[10px] font-mono text-[#202223] hover:border-[#2D6BFF] hover:bg-white"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedCategory === "marketing" ? (
                  <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50/80 to-white p-4">
                    <p className="text-[13px] font-semibold text-[#202223]">Campaign broadcast</p>
                    <p className={`mt-1 text-[12px] ${adminMuted}`}>Up to 50 recipients · uses saved template content</p>
                    <textarea
                      className={`${adminInputClass} mt-3 min-h-[88px] w-full font-mono text-[12px]`}
                      placeholder={"email1@example.com\nemail2@example.com"}
                      value={broadcastList}
                      onChange={(e) => setBroadcastList(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => void sendBroadcast()}
                      disabled={broadcastBusy}
                      className={`${adminBtnPrimary} mt-3`}
                    >
                      {broadcastBusy ? "Sending…" : "Send campaign"}
                    </button>
                    {broadcastMsg ? <p className="mt-2 text-[12px] text-emerald-800">{broadcastMsg}</p> : null}
                  </div>
                ) : null}
                <div className="rounded-xl border border-[#e3e5e7] bg-[#fafbfb] p-4">
                  <p className="text-[13px] font-semibold text-[#202223]">Test inbox</p>
                  <p className={`mt-1 text-[12px] ${adminMuted}`}>
                    Sends a single message with sample merge data to verify layout and delivery.
                  </p>
                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    <label className="min-w-[200px] flex-1 space-y-1">
                      <span className="text-[12px] font-semibold text-[#6d7175]">Email address</span>
                      <input
                        type="email"
                        className={`${adminInputClass} w-full`}
                        placeholder="you@example.com"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => void sendTest()}
                      disabled={testBusy || !testEmail}
                      className={adminBtnPrimary}
                    >
                      {testBusy ? "Sending…" : "Send test"}
                    </button>
                  </div>
                  {testMsg ? <p className="mt-2 text-[12px] font-medium text-emerald-800">{testMsg}</p> : null}
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className={`${adminPanelClass} flex flex-col overflow-hidden`}>
          <div className="border-b border-[#e3e5e7] px-4 py-3">
            <p className="text-[13px] font-semibold text-[#202223]">Preview</p>
            <p className={`truncate text-[12px] ${adminMuted}`}>{previewBusy ? "Rendering…" : previewSubject}</p>
          </div>
          <div className="relative min-h-[360px] flex-1 bg-[#eef0f2] p-3">
            {previewHtml ? (
              <iframe
                title="Email preview"
                srcDoc={previewHtml}
                className="h-[min(560px,72vh)] w-full rounded-lg border border-[#d1d5db] bg-white shadow-sm"
                sandbox=""
              />
            ) : (
              <p className={`flex h-full items-center justify-center p-4 text-[13px] ${adminMuted}`}>
                Select a template to preview
              </p>
            )}
          </div>
        </aside>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-[15px] font-semibold text-[#202223]">Activity log</h2>
            <p className={`text-[12px] ${adminMuted}`}>Last 50 sends across all templates</p>
          </div>
          <button type="button" onClick={() => void loadLog()} className={adminBtnSecondary}>
            Refresh
          </button>
        </div>
        <div className={adminTableWrap}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead className="border-b border-[#e3e5e7] bg-[#fafbfb] text-[12px] font-semibold text-[#6d7175]">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">To</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {logLoading && log.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`px-4 py-8 text-center ${adminMuted}`}>
                      Loading…
                    </td>
                  </tr>
                ) : null}
                {!logLoading && log.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={`px-4 py-8 text-center ${adminMuted}`}>
                      No sends yet — place an order or send a test.
                    </td>
                  </tr>
                ) : null}
                {log.map((row) => (
                  <tr key={row.id} className="border-b border-[#f1f2f3] last:border-0 hover:bg-[#fafbfb]">
                    <td className="whitespace-nowrap px-4 py-3 text-[12px] text-[#6d7175]">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#202223]">{templateName(row.templateId)}</p>
                      <p className="font-mono text-[10px] text-[#8c9196]">{row.templateId}</p>
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3">{row.toEmail}</td>
                    <td className="max-w-[220px] truncate px-4 py-3" title={row.subject}>
                      {row.subject}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[row.status]}`}
                      >
                        {row.status}
                      </span>
                      {row.error ? (
                        <p className="mt-1 max-w-[200px] truncate text-[11px] text-rose-700" title={row.error}>
                          {row.error}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
