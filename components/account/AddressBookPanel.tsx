"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { CustomerAddress } from "@/lib/addresses/types";
import { CHECKOUT_COUNTRY_OPTIONS } from "@/lib/checkout-country";
import { phoneDigitsOk } from "@/lib/addresses/validate";

const inputClass =
  "min-h-[46px] w-full rounded-xl border border-white/[0.12] bg-white/[0.05] px-3.5 text-[14px] text-white placeholder:text-white/35 focus:border-[#2D6BFF]/45 focus:outline-none focus:ring-2 focus:ring-[#2D6BFF]/20";

type FormState = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const emptyForm = (): FormState => ({
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  postalCode: "",
  country: "MA",
  isDefault: false,
});

function addrToForm(a: CustomerAddress): FormState {
  return {
    fullName: a.fullName,
    phone: a.phone,
    addressLine1: a.addressLine1,
    addressLine2: a.addressLine2 ?? "",
    city: a.city ?? "",
    region: a.region ?? "",
    postalCode: a.postalCode ?? "",
    country: a.country,
    isDefault: a.isDefault,
  };
}

export function AddressBookPanel() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/addresses", { credentials: "same-origin" });
      const data = (await res.json()) as { addresses?: CustomerAddress[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not load addresses");
      setAddresses(Array.isArray(data.addresses) ? data.addresses : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load addresses");
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const startAdd = () => {
    setMode("add");
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
  };

  const startEdit = (a: CustomerAddress) => {
    setMode("edit");
    setEditingId(a.id);
    setForm(addrToForm(a));
    setError(null);
  };

  const cancelForm = () => {
    setMode("list");
    setEditingId(null);
    setForm(emptyForm());
    setError(null);
  };

  const saveForm = async () => {
    setError(null);
    if (!form.fullName.trim()) {
      setError("Enter the recipient name.");
      return;
    }
    if (!phoneDigitsOk(form.phone)) {
      setError("Enter a valid phone number (at least 8 digits).");
      return;
    }
    if (!form.addressLine1.trim()) {
      setError("Enter address line 1.");
      return;
    }

    const body = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim() || null,
      city: form.city.trim() || null,
      region: form.region.trim() || null,
      postalCode: form.postalCode.trim() || null,
      country: form.country.trim().toUpperCase(),
      isDefault: form.isDefault,
    };

    try {
      if (mode === "add") {
        setBusyId("__add");
        const res = await fetch("/api/addresses", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as { address?: CustomerAddress; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Could not save");
        cancelForm();
        await load();
      } else if (mode === "edit" && editingId) {
        setBusyId(editingId);
        const res = await fetch(`/api/addresses/${editingId}`, {
          method: "PATCH",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as { address?: CustomerAddress; error?: string };
        if (!res.ok) throw new Error(data.error ?? "Could not update");
        cancelForm();
        await load();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Remove this address from your account?")) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE", credentials: "same-origin" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not delete");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const setDefault = async (id: string) => {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PATCH",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not update default");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const sorted = useMemo(() => {
    return [...addresses].sort((a, b) => {
      if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [addresses]);

  return (
    <div className="space-y-4">
      {error ? (
        <div role="alert" className="rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-[13px] text-rose-100/95">
          {error}
        </div>
      ) : null}

      {loading ? (
        <p className="text-[14px] text-white/45">Loading addresses…</p>
      ) : mode === "list" ? (
        <>
          {sorted.length === 0 ? (
            <p className="text-[14px] leading-relaxed text-white/48">
              No addresses saved yet. Add one for faster checkout — your default ships automatically when you select it at
              payment.
            </p>
          ) : (
            <ul className="space-y-3">
              {sorted.map((a) => (
                <li
                  key={a.id}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:px-5 sm:py-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[15px] font-semibold text-white/92">{a.fullName}</p>
                        {a.isDefault ? (
                          <span className="rounded-full border border-emerald-400/35 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-100/95">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-white/55">
                        {[a.addressLine1, a.addressLine2, [a.city, a.region, a.postalCode].filter(Boolean).join(", "), a.country]
                          .filter(Boolean)
                          .join("\n")}
                      </p>
                      <p className="mt-2 text-[13px] text-white/45">{a.phone}</p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {!a.isDefault ? (
                        <button
                          type="button"
                          disabled={busyId === a.id}
                          onClick={() => setDefault(a.id)}
                          className="rounded-lg border border-white/[0.14] bg-white/[0.06] px-3 py-2 text-[12px] font-semibold text-white/85 transition-colors hover:bg-white/[0.1] disabled:opacity-45"
                        >
                          Set default
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={busyId === a.id}
                        onClick={() => startEdit(a)}
                        className="rounded-lg border border-white/[0.14] bg-white/[0.06] px-3 py-2 text-[12px] font-semibold text-white/85 transition-colors hover:bg-white/[0.1] disabled:opacity-45"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={busyId === a.id}
                        onClick={() => remove(a.id)}
                        className="rounded-lg border border-rose-500/35 bg-rose-500/10 px-3 py-2 text-[12px] font-semibold text-rose-100/95 transition-colors hover:bg-rose-500/15 disabled:opacity-45"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-[#2D6BFF] px-5 text-[14px] font-semibold text-white shadow-[0_12px_36px_-14px_rgba(45,107,255,0.55)] transition-[transform,box-shadow] hover:shadow-[0_16px_40px_-12px_rgba(45,107,255,0.6)] active:scale-[0.99]"
          >
            Add address
          </button>
        </>
      ) : (
        <div className="space-y-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 sm:p-5">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-white/42">{mode === "add" ? "New address" : "Edit address"}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/38">Full name</span>
              <input
                className={inputClass}
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                autoComplete="name"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/38">Phone</span>
              <input
                className={inputClass}
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                autoComplete="tel"
                inputMode="tel"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/38">Country</span>
              <select
                className={`${inputClass} appearance-none`}
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              >
                {CHECKOUT_COUNTRY_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/38">Address line 1</span>
              <input
                className={inputClass}
                value={form.addressLine1}
                onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))}
                autoComplete="address-line1"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/38">
                Address line 2 <span className="font-normal normal-case text-white/30">(optional)</span>
              </span>
              <input
                className={inputClass}
                value={form.addressLine2}
                onChange={(e) => setForm((f) => ({ ...f, addressLine2: e.target.value }))}
                autoComplete="address-line2"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/38">City</span>
              <input
                className={inputClass}
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                autoComplete="address-level2"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/38">Region / state</span>
              <input
                className={inputClass}
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-white/38">Postal code</span>
              <input
                className={inputClass}
                value={form.postalCode}
                onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
                autoComplete="postal-code"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                className="size-4 rounded border-white/30 bg-white/10 text-[#2D6BFF] focus:ring-[#2D6BFF]/30"
              />
              <span className="text-[13px] text-white/70">Set as default shipping address</span>
            </label>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              disabled={busyId !== null}
              onClick={saveForm}
              className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-[#2D6BFF] px-5 text-[14px] font-semibold text-white disabled:opacity-45"
            >
              {busyId ? "Saving…" : "Save address"}
            </button>
            <button
              type="button"
              disabled={busyId !== null}
              onClick={cancelForm}
              className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-white/[0.14] bg-white/[0.06] px-5 text-[14px] font-semibold text-white/85 disabled:opacity-45"
            >
              Cancel
            </button>
          </div>
          <p className="text-[12px] leading-relaxed text-white/38">
            Checkout uses your saved rows when you&apos;re signed in. Manage defaults here — only one default applies at a time.
          </p>
        </div>
      )}
      <p className="text-[12px] text-white/38">
        Tip: open{" "}
        <Link href="/track-order" className="font-semibold text-[#8fa8e8] hover:text-[#b8c9ff]">
          Track order
        </Link>{" "}
        with your SVY reference anytime.
      </p>
    </div>
  );
}
