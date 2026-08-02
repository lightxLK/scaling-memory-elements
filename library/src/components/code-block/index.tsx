'use client'

import { cn } from '@/lib/utils'
import { useIsDarkTheme } from '@/lib/theme'
import { CheckIcon, CopyIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes } from 'react'
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { BundledLanguage, BundledTheme, HighlighterGeneric, ThemedToken } from 'shiki'
import { createHighlighter } from 'shiki'

// Shiki uses bitflags for font styles: 1=italic, 2=bold, 4=underline
const isItalic = (fontStyle: number | undefined) => fontStyle && fontStyle & 1
const isBold = (fontStyle: number | undefined) => fontStyle && fontStyle & 2
const isUnderline = (fontStyle: number | undefined) => fontStyle && fontStyle & 4

// Transform tokens to include pre-computed keys to avoid index-as-key lookups
interface KeyedToken {
  token: ThemedToken
  key: string
}
interface KeyedLine {
  tokens: KeyedToken[]
  key: string
}

const addKeysToTokens = (lines: ThemedToken[][]): KeyedLine[] =>
  lines.map((line, lineIdx) => ({
    key: `line-${lineIdx}`,
    tokens: line.map((token, tokenIdx) => ({
      key: `line-${lineIdx}-${tokenIdx}`,
      token,
    })),
  }))

// Shiki's dual-theme output puts the dark-mode color/background in
// `htmlStyle` as plain CSS-variable values (e.g. `--shiki-dark: "#F97583"`),
// meant to be read directly — not set as a literal CSS custom property and
// picked up via a `dark:` variant, which doesn't reliably apply here.
const TokenSpan = ({ token, isDark }: { token: ThemedToken; isDark: boolean }) => {
  const darkColor = token.htmlStyle?.['--shiki-dark'] as string | undefined
  const darkBg = token.htmlStyle?.['--shiki-dark-bg'] as string | undefined

  return (
    <span
      style={
        {
          backgroundColor: (isDark && darkBg) || token.bgColor,
          color: (isDark && darkColor) || token.color,
          fontStyle: isItalic(token.fontStyle) ? 'italic' : undefined,
          fontWeight: isBold(token.fontStyle) ? 'bold' : undefined,
          textDecoration: isUnderline(token.fontStyle) ? 'underline' : undefined,
        } as CSSProperties
      }
    >
      {token.content}
    </span>
  )
}

const LINE_NUMBER_CLASSES = cn(
  'block',
  'before:content-[counter(line)]',
  'before:inline-block',
  'before:[counter-increment:line]',
  'before:w-8',
  'before:mr-4',
  'before:text-right',
  'before:text-muted-foreground/50',
  'before:font-mono',
  'before:select-none'
)

const LineSpan = ({
  keyedLine,
  showLineNumbers,
  isDark,
}: {
  keyedLine: KeyedLine
  showLineNumbers: boolean
  isDark: boolean
}) => (
  <span className={showLineNumbers ? LINE_NUMBER_CLASSES : 'block'}>
    {keyedLine.tokens.length === 0
      ? '\n'
      : keyedLine.tokens.map(({ token, key }) => <TokenSpan key={key} token={token} isDark={isDark} />)}
  </span>
)

type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string
  language: BundledLanguage
  showLineNumbers?: boolean
}

interface TokenizedCode {
  tokens: ThemedToken[][]
  fg: string
  bg: string
}

interface CodeBlockContextType {
  code: string
}

const CodeBlockContext = createContext<CodeBlockContextType>({ code: '' })

// Highlighter cache (singleton per language)
const highlighterCache = new Map<string, Promise<HighlighterGeneric<BundledLanguage, BundledTheme>>>()

// Token cache
const tokensCache = new Map<string, TokenizedCode>()

// Subscribers for async token updates
const subscribers = new Map<string, Set<(result: TokenizedCode) => void>>()

const getTokensCacheKey = (code: string, language: BundledLanguage) => {
  const start = code.slice(0, 100)
  const end = code.length > 100 ? code.slice(-100) : ''
  return `${language}:${code.length}:${start}:${end}`
}

const getHighlighter = (
  language: BundledLanguage
): Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> => {
  const cached = highlighterCache.get(language)
  if (cached) return cached

  const highlighterPromise = createHighlighter({
    langs: [language],
    themes: ['github-light', 'github-dark'],
  })

  highlighterCache.set(language, highlighterPromise)
  return highlighterPromise
}

// Raw tokens for immediate display while highlighting loads
const createRawTokens = (code: string): TokenizedCode => ({
  bg: 'transparent',
  fg: 'inherit',
  tokens: code.split('\n').map((line) =>
    line === ''
      ? []
      : [
          {
            color: 'inherit',
            content: line,
          } as ThemedToken,
        ]
  ),
})

export const highlightCode = (
  code: string,
  language: BundledLanguage,
  callback?: (result: TokenizedCode) => void
): TokenizedCode | null => {
  const tokensCacheKey = getTokensCacheKey(code, language)

  const cached = tokensCache.get(tokensCacheKey)
  if (cached) return cached

  if (callback) {
    if (!subscribers.has(tokensCacheKey)) subscribers.set(tokensCacheKey, new Set())
    subscribers.get(tokensCacheKey)?.add(callback)
  }

  getHighlighter(language)
    .then((highlighter) => {
      const availableLangs = highlighter.getLoadedLanguages()
      const langToUse = availableLangs.includes(language) ? language : 'text'

      const result = highlighter.codeToTokens(code, {
        lang: langToUse,
        themes: { dark: 'github-dark', light: 'github-light' },
      })

      const tokenized: TokenizedCode = {
        bg: result.bg ?? 'transparent',
        fg: result.fg ?? 'inherit',
        tokens: result.tokens,
      }

      tokensCache.set(tokensCacheKey, tokenized)

      const subs = subscribers.get(tokensCacheKey)
      if (subs) {
        for (const sub of subs) sub(tokenized)
        subscribers.delete(tokensCacheKey)
      }
    })
    .catch((error) => {
      console.error('Failed to highlight code:', error)
      subscribers.delete(tokensCacheKey)
    })

  return null
}

const CodeBlockBody = memo(
  ({
    tokenized,
    showLineNumbers,
    className,
  }: {
    tokenized: TokenizedCode
    showLineNumbers: boolean
    className?: string
  }) => {
    // Shiki's own root bg/fg are compound CSS strings meant for raw HTML
    // interpolation (e.g. "#fff;--shiki-dark-bg:#24292e") — invalid as a
    // React style value. The container already tracks the site theme via
    // bg-background/text-foreground, so just inherit that instead.
    const isDark = useIsDarkTheme()
    const keyedLines = useMemo(() => addKeysToTokens(tokenized.tokens), [tokenized.tokens])

    return (
      <pre className={cn('m-0 bg-transparent p-4 text-sm text-foreground', className)}>
        <code
          className={cn('font-mono text-sm', showLineNumbers && '[counter-increment:line_0] [counter-reset:line]')}
        >
          {keyedLines.map((keyedLine) => (
            <LineSpan key={keyedLine.key} keyedLine={keyedLine} showLineNumbers={showLineNumbers} isDark={isDark} />
          ))}
        </code>
      </pre>
    )
  },
  (prevProps, nextProps) =>
    prevProps.tokenized === nextProps.tokenized &&
    prevProps.showLineNumbers === nextProps.showLineNumbers &&
    prevProps.className === nextProps.className
)

CodeBlockBody.displayName = 'CodeBlockBody'

export const CodeBlockContainer = ({
  className,
  language,
  style,
  ...props
}: HTMLAttributes<HTMLDivElement> & { language: string }) => (
  <div
    className={cn('group relative w-full overflow-hidden rounded-md border border-border bg-background text-foreground', className)}
    data-language={language}
    style={{ containIntrinsicSize: 'auto 200px', contentVisibility: 'auto', ...style }}
    {...props}
  />
)

export const CodeBlockHeader = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex items-center justify-between border-b border-border bg-muted/80 px-3 py-2 text-muted-foreground text-xs', className)}
    {...props}
  >
    {children}
  </div>
)

export const CodeBlockTitle = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center gap-2', className)} {...props}>
    {children}
  </div>
)

export const CodeBlockFilename = ({ children, className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn('font-mono', className)} {...props}>
    {children}
  </span>
)

export const CodeBlockActions = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('-my-1 -mr-1 flex items-center gap-2', className)} {...props}>
    {children}
  </div>
)

export const CodeBlockContent = ({
  code,
  language,
  showLineNumbers = false,
}: {
  code: string
  language: BundledLanguage
  showLineNumbers?: boolean
}) => {
  const rawTokens = useMemo(() => createRawTokens(code), [code])

  // Synchronous cache lookup — avoids setState in effect for cached results
  const syncTokens = useMemo(() => highlightCode(code, language) ?? rawTokens, [code, language, rawTokens])

  const [asyncTokens, setAsyncTokens] = useState<TokenizedCode | null>(null)
  const asyncKeyRef = useRef({ code, language })

  // Invalidate stale async tokens synchronously during render
  if (asyncKeyRef.current.code !== code || asyncKeyRef.current.language !== language) {
    asyncKeyRef.current = { code, language }
    setAsyncTokens(null)
  }

  useEffect(() => {
    let cancelled = false

    highlightCode(code, language, (result) => {
      if (!cancelled) setAsyncTokens(result)
    })

    return () => {
      cancelled = true
    }
  }, [code, language])

  const tokenized = asyncTokens ?? syncTokens

  return (
    <div className="relative overflow-auto">
      <CodeBlockBody showLineNumbers={showLineNumbers} tokenized={tokenized} />
    </div>
  )
}

export const CodeBlock = ({ code, language, showLineNumbers = false, className, children, ...props }: CodeBlockProps) => {
  const contextValue = useMemo(() => ({ code }), [code])

  return (
    <CodeBlockContext.Provider value={contextValue}>
      <CodeBlockContainer className={className} language={language} {...props}>
        {children}
        <CodeBlockContent code={code} language={language} showLineNumbers={showLineNumbers} />
      </CodeBlockContainer>
    </CodeBlockContext.Provider>
  )
}

export type CodeBlockCopyButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  onCopy?: () => void
  onError?: (error: Error) => void
  timeout?: number
}

export const CodeBlockCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false)
  const timeoutRef = useRef<number>(0)
  const { code } = useContext(CodeBlockContext)

  const copyToClipboard = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator?.clipboard?.writeText) {
      onError?.(new Error('Clipboard API not available'))
      return
    }

    try {
      if (!isCopied) {
        await navigator.clipboard.writeText(code)
        setIsCopied(true)
        onCopy?.()
        timeoutRef.current = window.setTimeout(() => setIsCopied(false), timeout)
      }
    } catch (error) {
      onError?.(error as Error)
    }
  }, [code, onCopy, onError, timeout, isCopied])

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current)
    },
    []
  )

  const Icon = isCopied ? CheckIcon : CopyIcon

  return (
    <button
      type="button"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-border/60 hover:text-foreground',
        className
      )}
      onClick={copyToClipboard}
      {...props}
    >
      {children ?? <Icon size={14} />}
    </button>
  )
}

const DEMO_CODE = `export function greet(name: string) {
  return \`Hello, \${name}!\`
}
`

export default function CodeBlockDemo() {
  return (
    <CodeBlock code={DEMO_CODE} language="typescript" showLineNumbers>
      <CodeBlockHeader>
        <CodeBlockTitle>
          <CodeBlockFilename>greet.ts</CodeBlockFilename>
        </CodeBlockTitle>
        <CodeBlockActions>
          <CodeBlockCopyButton />
        </CodeBlockActions>
      </CodeBlockHeader>
    </CodeBlock>
  )
}
