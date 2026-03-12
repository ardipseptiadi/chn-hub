/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the
 * component tree that crashed.
 *
 * Usage: Wrap your app or specific sections with this component.
 *
 * @example
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */

import { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log to console
    console.error("Error Boundary caught an error:", error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // You could also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md border-border">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
                  <AlertCircle className="text-destructive" size={32} />
                </div>
                <h1 className="font-serif text-2xl text-foreground mb-2">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground mb-6">
                  An unexpected error occurred. Please try again.
                </p>

                {/* Show error details in development */}
                {import.meta.env.DEV && this.state.error && (
                  <details className="w-full mb-4 text-left">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2">
                      Error details
                    </summary>
                    <div className="p-3 rounded-md bg-muted text-xs font-mono text-destructive overflow-auto max-h-32">
                      {this.state.error.toString()}
                      {this.state.error.stack}
                    </div>
                  </details>
                )}

                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.location.href = "/"}
                  >
                    Go Home
                  </Button>
                  <Button className="flex-1" onClick={this.handleReset}>
                    <RefreshCw size={16} className="mr-2" />
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simplified functional component version for inline error handling
 * Use this for smaller sections where you want inline error display
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
