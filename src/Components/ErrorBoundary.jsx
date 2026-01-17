import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl border border-red-100 overflow-hidden">
            
            <div className="bg-red-50 p-6 border-b border-red-100 flex items-center gap-4">
              <div className="bg-red-100 p-3 rounded-full text-red-600">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-700">Application Crashed</h2>
                <p className="text-red-500 text-sm">Something went wrong in the code.</p>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto mb-6">
                 {this.state.error && this.state.error.toString()}
                 <br/>
                 <span className="opacity-50">
                   {this.state.errorInfo && this.state.errorInfo.componentStack.slice(0, 200)}...
                 </span>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={this.handleReload}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <RefreshCcw size={18} /> Reload Page
                </button>
                <button 
                  onClick={this.handleClearCache}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition"
                >
                  Clear Cache & Reset
                </button>
              </div>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;