import { Component } from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-[290px] flex-col items-center justify-center gap-3 px-4 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-panel-2 text-text-3">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-text">Unexpected error</h2>
          <p className="max-w-[220px] text-xs leading-relaxed text-text-3">{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
