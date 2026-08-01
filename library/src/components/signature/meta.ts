import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'signature',
  name: 'Signature',
  description: 'Hand-written SVG signature draw-on animation generated from a font via opentype.js.',
  category: 'Typography',
  tags: ['svg', 'signature', 'handwriting', 'opentype'],
  family: 'componentry',
  deps: ['framer-motion', 'opentype.js'],
  runnable: true,
}

export default meta
