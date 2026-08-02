export type Category =
  | 'Hover'
  | 'Cards'
  | 'Navigation'
  | 'Scrolling'
  | 'Typography'
  | 'Cursor'
  | 'Motion'
  | '3D'
  | 'Toggle'
  | 'Showcase'
  | 'Code'

export type Family = 'react-bits' | 'componentry' | 'misc' | 'full-page'

export interface ComponentMeta {
  slug: string
  name: string
  description: string
  category: Category
  tags: string[]
  family: Family
  deps: string[]
  runnable: boolean
  previewHeight?: number
  background?: 'light' | 'dark' | 'transparent'
  scrollable?: boolean
  notes?: string
}
