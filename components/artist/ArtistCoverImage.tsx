"use client";

import { useState } from "react";

type Props = {
  coverSrc: string;
  /** Shown if cover is missing or fails to load */
  fallbackSrc: string;
  alt: string;
  className?: string;
};

export function ArtistCoverImage({ coverSrc, fallbackSrc, alt, className }: Props) {
  const [src, setSrc] = useState(coverSrc);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      decoding="async"
      onError={() => {
        if (src !== fallbackSrc) setSrc(fallbackSrc);
      }}
    />
  );
}
