import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * If the WebGL canvas throws during init or render (driver issues, context
 * loss), we swap to the CSS fallback so the invitation journey always remains
 * usable (spec §19).
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep the console signal for developers without breaking the visitor.
    console.error('WebGL scene failed; using CSS fallback.', error, info);
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
