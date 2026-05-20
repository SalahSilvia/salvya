"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  fileToResizedDataUrl,
  readProfileExtension,
  writeProfileExtension,
  type SalvyaUserProfileExtension,
} from "@/lib/member/user-profile-storage";

const ease = [0.22, 1, 0.36, 1] as const;
const MAX_DATA_URL = 1_400_000;

export type EditProfileSheetProps = {
  open: boolean;
  onClose: () => void;
  userId: string;
  email: string;
  authDisplayName: string;
  authAvatarUrl: string | null;
  authCreatedAt: string | null;
  onSaved: () => void;
};

export function EditProfileSheet({
  open,
  onClose,
  userId,
  email,
  authDisplayName,
  authAvatarUrl,
  authCreatedAt,
  onSaved,
}: EditProfileSheetProps) {
  const reduceMotion = useReducedMotion();
  const labelId = useId();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetFromStorage = useCallback(() => {
    const cur = readProfileExtension(userId);
    setName(cur.displayName || authDisplayName);
    setUsername(cur.username || "");
    setBio(cur.bio || "");
    setAvatarUrl(cur.avatarUrl ?? authAvatarUrl);
    setCoverUrl(cur.coverUrl);
    setError(null);
  }, [userId, authDisplayName, authAvatarUrl]);

  useEffect(() => {
    if (open) resetFromStorage();
  }, [open, resetFromStorage]);

  const applyImage = useCallback(
    async (file: File, kind: "avatar" | "cover") => {
      setError(null);
      if (!file.type.startsWith("image/")) {
        setError("Please choose an image file.");
        return;
      }
      try {
        const edge = kind === "avatar" ? 640 : 1280;
        const q = kind === "avatar" ? 0.82 : 0.72;
        const dataUrl = await fileToResizedDataUrl(file, { maxEdge: edge, quality: q });
        if (dataUrl.length > MAX_DATA_URL) {
          setError("That image is still too large after compressing — try another photo.");
          return;
        }
        if (kind === "avatar") setAvatarUrl(dataUrl);
        else setCoverUrl(dataUrl);
      } catch {
        setError("Could not read that image.");
      }
    },
    [],
  );

  const onDrop = useCallback(
    (e: React.DragEvent, kind: "avatar" | "cover") => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f) void applyImage(f, kind);
    },
    [applyImage],
  );

  const save = useCallback(async () => {
    const cur = readProfileExtension(userId);
    const createdAtIso = cur.createdAtIso ?? authCreatedAt ?? new Date().toISOString();
    const next: SalvyaUserProfileExtension = {
      ...cur,
      userId,
      displayName: name.trim(),
      username: username.trim().replace(/^@/, ""),
      bio: bio.trim().slice(0, 280),
      avatarUrl,
      coverUrl,
      createdAtIso,
    };
    writeProfileExtension(userId, next);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: next.displayName,
          username: next.username,
          bio: next.bio,
          phone: next.phone,
          country: next.country,
          avatarUrl: next.avatarUrl,
          coverUrl: next.coverUrl,
        }),
      });
      const body = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? "Save failed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save profile");
      return;
    }
    onSaved();
    onClose();
  }, [userId, name, username, bio, avatarUrl, coverUrl, authCreatedAt, onSaved, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[220] flex items-end justify-center sm:items-center sm:p-6"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/55 backdrop-blur-[6px]"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelId}
            initial={reduceMotion ? false : { y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? undefined : { y: 32, opacity: 0 }}
            transition={{ duration: 0.38, ease }}
            className="relative z-[1] flex max-h-[min(92dvh,52rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-[1.75rem] border border-white/[0.12] bg-[#0a0a12]/95 shadow-[0_-20px_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl sm:rounded-[1.75rem]"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <h2 id={labelId} className="m-0 text-lg font-semibold tracking-[-0.02em] text-white">
                Edit profile
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-white/70 transition-colors hover:bg-white/[0.09]"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
              {error ? (
                <p className="mb-4 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-[13px] text-rose-100/95">{error}</p>
              ) : null}

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Profile photo</p>
                  <div
                    className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.14] bg-white/[0.03] px-3 py-5 transition-colors hover:border-[#2D6BFF]/35 hover:bg-white/[0.05]"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, "avatar")}
                    onClick={() => avatarInputRef.current?.click()}
                    role="presentation"
                  >
                    <div className="relative h-28 w-28 overflow-hidden rounded-full ring-2 ring-white/[0.12] ring-offset-2 ring-offset-[#0a0a12]">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- data URL preview
                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-white/[0.06] text-[13px] text-white/45">Tap to add</div>
                      )}
                      <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-white/0 transition-colors hover:bg-black/35 hover:text-white/90">
                        <span className="rounded-full bg-black/55 px-2 py-1 text-[11px] font-semibold opacity-0 transition-opacity hover:opacity-100">Camera</span>
                      </span>
                    </div>
                    <p className="mt-2 text-center text-[11px] text-white/38">Tap or drop — circular crop preview</p>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void applyImage(f, "avatar");
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Cover image</p>
                  <div
                    className="mt-2 flex h-36 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/[0.14] bg-white/[0.03] transition-colors hover:border-[#2D6BFF]/35 hover:bg-white/[0.05]"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, "cover")}
                    onClick={() => coverInputRef.current?.click()}
                    role="presentation"
                  >
                    {coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <p className="px-3 text-center text-[12px] text-white/40">Wide banner — tap or drop</p>
                    )}
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void applyImage(f, "cover");
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              </div>

              <label className="mt-6 block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 py-3 text-[15px] text-white outline-none ring-0 placeholder:text-white/30 focus:border-[#2D6BFF]/45"
                  placeholder="Your name"
                  autoComplete="name"
                />
              </label>

              <label className="mt-4 block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Username</span>
                <div className="mt-2 flex items-center rounded-xl border border-white/[0.1] bg-white/[0.06] px-3 focus-within:border-[#2D6BFF]/45">
                  <span className="text-[15px] text-white/35">@</span>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                    className="min-w-0 flex-1 border-0 bg-transparent py-3 pl-1 text-[15px] text-white outline-none ring-0 placeholder:text-white/30"
                    placeholder="handle"
                    autoComplete="username"
                  />
                </div>
              </label>

              <label className="mt-4 block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Email</span>
                <input
                  value={email}
                  readOnly
                  className="mt-2 w-full cursor-not-allowed rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-[15px] text-white/45 outline-none"
                />
                <p className="mt-1 text-[11px] text-white/32">Email changes will arrive with account security later.</p>
              </label>

              <label className="mt-4 block">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">Bio</span>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={280}
                  className="mt-2 w-full resize-none rounded-xl border border-white/[0.1] bg-white/[0.06] px-4 py-3 text-[14px] leading-relaxed text-white outline-none ring-0 placeholder:text-white/30 focus:border-[#2D6BFF]/45"
                  placeholder="A line about your style, favorite artists, or how you run your fits."
                />
              </label>

              <div className="mt-6 flex flex-col gap-2 pb-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-12 rounded-xl border border-white/[0.12] bg-white/[0.05] px-5 text-[14px] font-semibold text-white/85 transition-colors hover:bg-white/[0.09]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void save()}
                  className="min-h-12 rounded-xl bg-[#2D6BFF] px-5 text-[14px] font-semibold text-white shadow-[0_12px_36px_-14px_rgba(45,107,255,0.55)] transition-[transform,filter] hover:brightness-110 active:scale-[0.99]"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
