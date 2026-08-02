"use client";

import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export interface StickyScrollCardItem {
  title: string;
  src: string;
}

const DEFAULT_CARDS: StickyScrollCardItem[] = [
  {
    title: "Misty Alps",
    src: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=85",
  },
  {
    title: "Sunlit Grove",
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85",
  },
  {
    title: "Turquoise Shore",
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=85",
  },
  {
    title: "Mountain Pass",
    src: "https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=1200&q=85",
  },
  {
    title: "Rolling Hills",
    src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=85",
  },
];

// Very subtle tilts — natural scatter without looking messy
const CARD_ROTATIONS = [-1.4, 1.0, -0.8, 1.6, -1.1];

// Fixed viewport height for the self-contained scroll stage — the sticky
// cards pin to this box instead of the browser viewport (h-screen/vh units
// escape a bounded preview card and drive scroll off the whole page).
const STAGE_HEIGHT = 640;

interface StickyScrollCardProps {
  i: number;
  title: string;
  src: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
  targetScale: number;
}

function StickyScrollCard({
  i,
  title,
  src,
  progress,
  range,
  targetScale,
}: StickyScrollCardProps) {
  const scale = useTransform(progress, range, [1, targetScale]);
  const rotation = CARD_ROTATIONS[i % CARD_ROTATIONS.length];

  return (
    <div
      className="sticky top-0 flex items-center justify-center"
      style={{ height: STAGE_HEIGHT }}
    >
      <motion.div
        style={{
          scale,
          rotate: rotation,
          top: `calc(${-STAGE_HEIGHT * 0.05}px + ${i * 22 + 160}px)`,
          borderRadius: 4,
          boxShadow:
            "0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.07), 0 12px 32px rgba(0,0,0,0.10), 0 24px 56px rgba(0,0,0,0.08)",
        }}
        className="relative -top-1/4 origin-top overflow-hidden bg-white"
      >
        {/* 10px border on three sides */}
        <div className="p-[10px] pb-0">
          <div className="w-[460px] overflow-hidden">
            <img
              src={src}
              alt={title}
              className="block h-[290px] w-full object-cover"
              draggable={false}
            />
          </div>
        </div>

        {/* Caption strip — trimmed height */}
        <div className="flex h-[44px] items-center justify-center px-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            {title}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

interface StickyScrollCardsProps {
  /** Array of card items, each with a title and image src URL */
  cards?: StickyScrollCardItem[];
  /** Hint label shown above the stack */
  hint?: string;
  /** Additional CSS classes for the outer container */
  className?: string;
}

export function StickyScrollCards({
  cards = DEFAULT_CARDS,
  hint = "scroll to explore",
  className,
}: StickyScrollCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    container: scrollRef,
    target: targetRef,
    offset: ["start start", "end end"],
  });

  return (
    <div
      ref={scrollRef}
      className="relative w-full overflow-y-auto overflow-x-hidden rounded-md [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      style={{ height: STAGE_HEIGHT }}
    >
      <main
        ref={targetRef}
        className={cn(
          "relative flex w-full flex-col items-center justify-center",
          className
        )}
        style={{ paddingBottom: STAGE_HEIGHT, paddingTop: STAGE_HEIGHT / 2 }}
      >
        {/* Hint label */}
        <div className="absolute left-1/2 top-[8%] flex -translate-x-1/2 flex-col items-center gap-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] opacity-30">
            {hint}
          </p>
          <span className="h-12 w-px bg-gradient-to-b from-foreground/30 to-transparent" />
        </div>

        {cards.map((card, i) => {
          const targetScale = Math.max(0.5, 1 - (cards.length - i - 1) * 0.1);
          return (
            <StickyScrollCard
              key={`card_${i}`}
              i={i}
              {...card}
              progress={scrollYProgress}
              range={[i * 0.25, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </main>
    </div>
  );
}

export default StickyScrollCards;
