// Error Boundary Component
import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg p-4">
          <div className="max-w-md w-full bg-light-card dark:bg-dark-card rounded-lg shadow-soft p-8 text-center">
            <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
            <h2 className="text-2xl font-semibold mb-2 text-light-text dark:text-dark-text">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-teal text-white rounded-lg hover:bg-teal-hover transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
