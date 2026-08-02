"use client"

import { useRef, type RefObject } from "react"
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ScrollSplitCardItem {
  title: string
  description: string
  bgColor: string
  textColor: string
}

export interface ScrollSplitCardProps {
  /**
   * Ref to the scrollable container that drives the animation. Pass this
   * when you already own a full-height scroll container (see the original
   * usage example). If omitted, the component manages its own scroll
   * container instead, so it also works standalone with no props.
   */
  containerRef?: RefObject<HTMLDivElement | null>
  imageSrc?: string
  cards?: ScrollSplitCardItem[]
  /** Height (px) of the sticky viewport. Only used in standalone mode
   *  (no containerRef passed), since the component then owns its own
   *  fixed-height scroll container instead of filling the caller's. */
  height?: number
  className?: string
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=1600&q=80"

const DEFAULT_CARDS: ScrollSplitCardItem[] = [
  {
    title: "Going Zero to One",
    description:
      "If you're navigating a new business idea and need to validate it before breaking into a new market.",
    bgColor: "#e2e2e2",
    textColor: "#111111",
  },
  {
    title: "Scaling from One to N",
    description:
      "If you've achieved product/market fit and need systems that hold up under real growth.",
    bgColor: "#1a5bcf",
    textColor: "#ffffff",
  },
  {
    title: "Need Quick Solutions",
    description:
      "If you know exactly what you want and need it shipped without the runway.",
    bgColor: "#1c1c1c",
    textColor: "#ffffff",
  },
]

function SplitPanel({
  card,
  index,
  count,
  progress,
}: {
  card: ScrollSplitCardItem
  index: number
  count: number
  progress: MotionValue<number>
}) {
  const start = index / count
  const end = (index + 1) / count
  const y = useTransform(progress, [start, end], ["100%", "0%"])

  return (
    <motion.div
      style={{ y, backgroundColor: card.bgColor, color: card.textColor }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-10 text-center"
    >
      <h3 className="text-2xl font-semibold">{card.title}</h3>
      <p className="max-w-md text-sm opacity-80">{card.description}</p>
    </motion.div>
  )
}

export function ScrollSplitCard({
  containerRef,
  imageSrc = DEFAULT_IMAGE,
  cards = DEFAULT_CARDS,
  height = 480,
  className,
}: ScrollSplitCardProps) {
  const internalRef = useRef<HTMLDivElement>(null)
  const ownsContainer = !containerRef
  const target = containerRef ?? internalRef
  const { scrollYProgress } = useScroll({ target, offset: ["start start", "end end"] })

  const stage = (
    <div style={{ height: `${cards.length * 100}%` }} className="relative">
      <div
        className={cn("sticky top-0 w-full overflow-hidden", !ownsContainer && "h-screen")}
        style={ownsContainer ? { height } : undefined}
      >
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        {cards.map((card, i) => (
          <SplitPanel key={card.title} card={card} index={i} count={cards.length} progress={scrollYProgress} />
        ))}
      </div>
    </div>
  )

  if (!ownsContainer) return stage

  return (
    <div
      ref={internalRef}
      data-lenis-prevent
      style={{ height }}
      className={cn(
        "relative w-full overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        className
      )}
    >
      {stage}
    </div>
  )
}

export default ScrollSplitCard
