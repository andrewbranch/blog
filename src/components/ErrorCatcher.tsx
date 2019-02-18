import React, { ErrorInfo } from 'react';
import { safeGA } from '../utils/safeGA';

export interface ErrorCatcherProps {
  renderFallback: () => React.ReactNode;
}

export class ErrorCatcher extends React.Component<ErrorCatcherProps, { error: boolean }> {
  public state = { error: false };

  public componentDidCatch(error: Error, info: ErrorInfo) {
    try {
      safeGA('send', 'event', 'error', {
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
