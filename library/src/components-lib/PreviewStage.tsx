import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  children: ReactNode
  previewHeight?: number
  background?: 'light' | 'dark' | 'transparent'
  scrollable?: boolean
}

export function PreviewStage({ children, previewHeight = 650, background = 'light', scrollable = false }: Props) {
  return (
    <div
      style={{ minHeight: `${previewHeight}px` }}
      className={cn(
        'flex items-center justify-center p-10 rounded-lg',
        scrollable ? 'overflow-y-auto' : 'overflow-hidden',
        background === 'dark' && 'bg-muted text-foreground',
        background === 'light' && 'bg-[#f2f0ea] text-[#14110b]',
        background === 'transparent' && 'bg-transparent'
      )}
    >
      {children}
    </div>
  )
}
