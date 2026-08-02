import type { ComponentMeta } from '@/types'

const meta: ComponentMeta = {
  slug: 'code-block',
  name: 'Code Block',
  description: 'Shiki-highlighted code block with filename header and copy-to-clipboard button.',
  category: 'Code',
  tags: ['code', 'syntax-highlight', 'shiki', 'copy'],
  family: 'componentry',
  deps: ['shiki'],
  runnable: true,
  background: 'dark',
}

export default meta
