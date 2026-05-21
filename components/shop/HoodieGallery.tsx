"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useState } from "react";
import { SalvyaOptimizedImage } from "@/components/media/SalvyaOptimizedImage";
import { deriveVariantUrls } from "@/lib/media/image-optimization/variant-urls";
import { shopImageSrc } from "@/lib/shop-data";
import { artistCatalogHoodieImageSrc } from "@/lib/elgrandetoto-hoodie-public";
import { artistCatalogTshirtImageSrc } from "@/lib/elgrandetoto-tshirt-public";

type Props =
  | {
      productName: string;
      orderedFiles: string[];
      source: "shop";
      artistSlug: string;
    }
  | {
      productName: string;
      orderedFiles: string[];
      source: "artistCatalogHoodie";
      artistSlug: string;
      folder: string;
    }
  | {
      productName: string;
      orderedFiles: string[];
      source: "artistCatalogTshirt";
      artistSlug: string;
      folder: string;
    }
  | {
      productName: string;
      imageUrls: string[];
      source: "urls";
    };

const ease = [0.22, 1, 0.36, 1] as const;

function imageSrc(props: Props, file: string): string {
  if (props.source === "urls") return file;
  if (props.source === "shop") return shopImageSrc(props.artistSlug, file);
  if (props.source === "artistCatalogTshirt") {
    return artistCatalogTshirtImageSrc(props.artistSlug, props.folder, file);
  }
  return artistCatalogHoodieImageSrc(props.artistSlug, props.folder, file);
}

function galleryKeys(props: Props): string[] {
  if (props.source === "urls") return props.imageUrls;
  return props.orderedFiles;
}

const mainImageVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir * 36,
    scale: 1.03,
    filter: "brightness(0.92)",
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "brightness(1)",
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -36,
    scale: 0.98,
    filter: "brightness(0.88)",
  }),
};

export function HoodieGallery(props: Props) {
  const { productName } = props;
  const keys = galleryKeys(props);
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(0);

  const safeIndex = Math.min(active, Math.max(0, keys.length - 1));
  const mainFile = keys[safeIndex] ?? keys[0];
  const total = keys.length;

  const selectIndex = useCallback(
    (next: number) => {
      if (next === safeIndex) return;
      setDirection(next > safeIndex ? 1 : -1);
      setActive(next);
    },
    [safeIndex],
  );

  if (!mainFile) {
    return (
      <div className="relative w-full overflow-hidden rounded-b-[1.5rem] bg-[#0b0b10] sm:rounded-b-[1.75rem]">
        <div className="flex aspect-[4/5] w-full flex-col items-center justify-center px-6 text-center">
          <p className="text-[15px] font-medium text-white/42">No images yet</p>
          <p className="mt-2 max-w-[17rem] text-[14px] leading-relaxed text-white/30">
            Add files to the product folder — they will appear here automatically.
          </p>
        </div>
      </div>
    );
  }

  const mainTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.38, ease };

  return (
    <div className="relative w-full overflow-hidden rounded-b-[1.5rem] bg-[#0b0b10] sm:rounded-b-[1.75rem]">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={mainFile}
            custom={direction}
            variants={reduceMotion ? undefined : mainImageVariants}
            initial={reduceMotion ? false : "enter"}
            animate={reduceMotion ? undefined : "center"}
            exit={reduceMotion ? undefined : "exit"}
            transition={mainTransition}
            className="absolute inset-0 z-0"
          >
            <SalvyaOptimizedImage
              src={imageSrc(props, mainFile)}
              variants={deriveVariantUrls(imageSrc(props, mainFile))}
              alt={`${productName} — view ${safeIndex + 1}`}
              fill
              context="gallery"
              priority={safeIndex === 0}
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-24 bg-gradient-to-b from-black/45 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 bg-gradient-to-t from-black/50 to-transparent"
          aria-hidden
        />

        {total > 1 ? (
          <div
            className="absolute z-20 flex w-[3.25rem] flex-col items-stretch justify-center gap-2 overflow-y-auto overflow-x-hidden pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:w-14 sm:gap-2.5 [&::-webkit-scrollbar]:hidden"
            aria-label="Product views"
            style={{
              top: "max(4.25rem, calc(env(safe-area-inset-top) + 3.5rem))",
              bottom: "3.25rem",
              left: "max(0.65rem, env(safe-area-inset-left))",
            }}
          >
            {keys.map((file, i) => {
              const isActive = i === safeIndex;
              return (
                <motion.button
                  key={file}
                  type="button"
                  onClick={() => selectIndex(i)}
                  layout={!reduceMotion}
                  animate={
                    reduceMotion
                      ? undefined
                      : {
                          scale: isActive ? 1.03 : 1,
                          opacity: isActive ? 1 : 0.5,
                        }
                  }
                  whileHover={reduceMotion ? undefined : { scale: isActive ? 1.03 : 1.02, opacity: 0.92 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  className={`relative aspect-[3/4] w-full overflow-hidden rounded-lg ${
                    isActive
                      ? "z-[1] shadow-md shadow-black/25 ring-1 ring-white/40"
                      : "hover:z-[1]"
                  }`}
                  aria-label={`View ${i + 1} of ${total}`}
                  aria-pressed={isActive}
                >
                  <img
                    src={imageSrc(props, file)}
                    alt=""
                    className="h-full w-full object-cover"
                    decoding="async"
                  />
                </motion.button>
              );
            })}
          </div>
        ) : null}

        {total > 1 ? (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-[14%] z-30 flex justify-center px-4"
            role="presentation"
          >
            <div
              className="pointer-events-auto flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-2 backdrop-blur-md"
              role="tablist"
              aria-label={`${total} product photos`}
            >
              {keys.map((file, i) => {
                const isActive = i === safeIndex;
                return (
                  <motion.button
                    key={file}
                    type="button"
                    role="tab"
                    layout={!reduceMotion}
                    aria-selected={isActive}
                    aria-label={`Photo ${i + 1} of ${total}`}
                    onClick={() => selectIndex(i)}
                    animate={reduceMotion ? undefined : { opacity: isActive ? 1 : 0.45 }}
                    whileHover={reduceMotion ? undefined : { opacity: isActive ? 1 : 0.7 }}
                    transition={{ type: "spring", stiffness: 480, damping: 32 }}
                    className={`h-2 shrink-0 rounded-full transition-[width,box-shadow] duration-300 ${
                      isActive
                        ? "w-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        : "w-2 bg-white/70"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
