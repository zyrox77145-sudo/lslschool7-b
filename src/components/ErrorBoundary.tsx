import React from 'react';
import { PixelAlertIcon } from './PixelIcons';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Application error caught by ErrorBoundary:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="pixel-grid-bg flex min-h-screen w-screen items-center justify-center bg-[#05070d] px-4 text-slate-100">
          <div className="pixel-panel-error w-full max-w-md p-6 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center border-2 border-rose-400 bg-rose-500/20 text-rose-300">
              <PixelAlertIcon className="h-6 w-6" />
            </div>
            <div className="font-display mt-3 text-base font-bold text-rose-300">
              Connection Error
            </div>
            <p className="mt-2 text-sm text-slate-200">
              Unable to synchronize with the cloud schedule. Please check your internet connection and reload.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="pixel-btn mt-5 inline-flex min-h-10 items-center justify-center border-2 border-cyan-300 bg-cyan-500 px-5 py-2 font-display text-xs font-bold text-slate-950 hover:bg-cyan-400"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
