"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cx } from "./SalvyaSkeletonPrimitives";

type Props = Omit<ImageProps, "onLoad"> & {
  skeletonClassName?: string;
  /** Wrapper around the image (layout / aspect). */
  frameClassName?: string;
};

/** Next/Image with fixed aspect placeholder — prevents layout shift while loading. */
export function SalvyaImageFrame({ frameClassName, skeletonClassName, alt, className, ...props }: Props) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={cx("relative overflow-hidden", frameClassName)}>
      {!loaded ? (
        <div
          className={cx(
            "absolute inset-0 bg-white/[0.06] salvya-sk-sheen-dark salvya-sk-breathe-dark",
            skeletonClassName,
          )}
          aria-hidden
        />
      ) : null}
      <Image
        {...props}
        alt={alt}
        className={cx(
          "relative z-[1] h-full w-full object-cover transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
