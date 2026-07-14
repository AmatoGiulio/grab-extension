import { Component } from 'react';
import { AlertCircle } from 'lucide-react';

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
          <div className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-muted text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Unexpected error</h2>
          <p className="max-w-[220px] text-xs leading-relaxed text-muted-foreground">{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
