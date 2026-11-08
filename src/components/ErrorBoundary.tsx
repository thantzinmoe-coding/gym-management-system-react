import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  /** When this value changes (for example the current URL), a shown error is cleared. */
  resetKey?: string;
}

interface State {
  error: Error | null;
}

/**
 * Catches a rendering error in the part of the page it wraps and shows a message with a
 * retry button, instead of letting React unmount the whole app (a blank white page).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Page crashed:', error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Card className="mx-auto mt-10 max-w-lg">
        <CardHeader>
          <CardTitle>Something went wrong on this page</CardTitle>
          <CardDescription>
            The rest of the app still works. Try again, or open another page from the menu.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={() => this.setState({ error: null })}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>Reload page</Button>
        </CardContent>
      </Card>
    );
  }
}
