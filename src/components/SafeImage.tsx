"use client";

import { useState } from "react";

interface SafeImageProps {
  src: string;
  fallbackSeed: string;
  alt: string;
  className?: string;
  sizes?: string;
}

/**
 * Renders a remote image with a guaranteed fallback. If the primary source
 * fails (e.g. an Unsplash URL 404s), it swaps to a deterministic picsum.photos
 * image keyed by `fallbackSeed`, so a client demo never shows a broken image.
 */
export function SafeImage({
  src,
  fallbackSeed,
  alt,
  className,
}: SafeImageProps) {
  const [current, setCurrent] = useState(src);
  const [triedFallback, setTriedFallback] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => {
        if (!triedFallback) {
          setTriedFallback(true);
          setCurrent(`https://picsum.photos/seed/${fallbackSeed}/1200/800`);
        }
      }}
    />
  );
}
