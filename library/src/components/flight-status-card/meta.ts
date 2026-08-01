import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'flight-status-card',
  name: 'Flight Status Card',
  description: 'Flight-tracker widget with dot-matrix airport codes, progress bar, and ETA.',
  category: 'Cards',
  tags: ['widget', 'flight', 'dot-matrix', 'travel'],
  family: 'componentry',
  deps: ['framer-motion', 'clsx', 'tailwind-merge'],
  runnable: true,
}

export default meta
