import { Component, type ReactNode } from 'react'

interface Props {
  slug: string
  onRetry: () => void
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert" className="p-10 text-center text-current">
          {/* Uses opacity on the inherited color rather than a fixed token,
              since this renders on both the light and dark preview stage. */}
          <p className="font-mono text-[0.68rem] tracking-[0.08em] opacity-60">
            SPECIMEN FAILED — {this.props.slug}
          </p>
          <p className="mt-2 text-sm text-red-500">{this.state.error.message}</p>
          <button
            onClick={this.props.onRetry}
            className="mt-4 rounded-full border border-current/20 px-3 py-1 font-mono text-[0.68rem] tracking-[0.06em] opacity-60 transition-opacity hover:opacity-100"
          >
            RETRY
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
