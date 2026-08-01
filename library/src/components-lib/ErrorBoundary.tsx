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
        <div role="alert" className="p-6 text-center">
          <p className="font-semibold">Component crashed: {this.props.slug}</p>
          <p className="text-sm text-red-500 mt-1">{this.state.error.message}</p>
          <button
            onClick={this.props.onRetry}
            className="mt-3 px-3 py-1 rounded bg-neutral-800 text-white"
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
