import React, { ErrorInfo } from 'react';

export interface ErrorCatcherProps {
  renderFallback: () => React.ReactNode;
}

export class ErrorCatcher extends React.Component<ErrorCatcherProps, { error: boolean }> {
  public state = { error: false };

  public componentDidCatch(error: Error, info: ErrorInfo) {
    try {
      ga('send', 'event', 'error', {
        message: error.message,
        componentStack: info.componentStack,
      });
    } catch { /**/ }
    this.setState({ error: true });
  }

  public render() {
    return this.state.error ? this.props.renderFallback() : this.props.children;
  }
}
