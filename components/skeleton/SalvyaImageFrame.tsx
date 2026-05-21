"use client";

import { SalvyaOptimizedImage } from "@/components/media/SalvyaOptimizedImage";
import type { ImageDisplayContext } from "@/lib/media/image-optimization/types";
import type { ComponentProps } from "react";

type Props = Omit<ComponentProps<typeof SalvyaOptimizedImage>, "context"> & {
  skeletonClassName?: string;
  frameClassName?: string;
  context?: ImageDisplayContext;
};

/** Next/Image with fixed aspect placeholder — prevents layout shift while loading. */
export function SalvyaImageFrame({
  frameClassName,
  skeletonClassName,
  context = "card",
  aspectClassName,
  showSkeleton = true,
  ...props
}: Props) {
  return (
    <SalvyaOptimizedImage
      {...props}
      context={context}
      aspectClassName={aspectClassName ?? frameClassName}
      showSkeleton={showSkeleton}
      className={props.className}
    />
  );
}
