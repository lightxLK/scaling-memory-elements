import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'scroll-split-card',
  name: 'Scroll Split Card',
  description: 'Scroll-driven story card: colored panels rise over a background image to reveal title and description as you scroll.',
  category: 'Cards',
  tags: ['scroll', 'story', 'reveal', 'framer-motion'],
  family: 'misc',
  deps: ['framer-motion'],
  runnable: true,
  // Standalone mode already builds its own fixed-height, scrollbar-hidden
  // scroll container - leaving this true double-wraps it in the preview
  // stage's own (visible-scrollbar) overflow-y-auto box.
  scrollable: false,
  notes: 'Original shadcn-distributed source was never captured (see raw-misc/v9.txt) - this is a fresh implementation built from the captured usage example (containerRef, imageSrc, cards props).',
}

export default meta
