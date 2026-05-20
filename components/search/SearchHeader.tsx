"use client";

const ease = [0.22, 1, 0.36, 1] as const;

export function SearchHeader() {
  return (
    <div className="px-1">
      <h1 className="m-0 text-[clamp(1.75rem,6.5vw,2.2rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-white">
        Search
      </h1>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-white/48">
        Artists, drops, collections, and culture
      </p>
    </div>
  );
}

export { ease };
