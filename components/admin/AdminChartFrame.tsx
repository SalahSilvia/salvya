"use client";

import { useEffect, useState, type ReactNode } from "react";

/** Defers Recharts until after layout so ResponsiveContainer gets real dimensions. */
export function AdminChartFrame({
  height = 260,
  children,
  className,
}: {
  height?: number;
  children: ReactNode;
  className?: string;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <div
      className={`w-full min-w-0 ${className ?? ""}`.trim()}
      style={{ height, minHeight: height }}
    >
      {ready ? children : null}
    </div>
  );
}
