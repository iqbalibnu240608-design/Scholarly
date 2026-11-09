import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-4 shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            Terjadi Kendala pada Tampilan Halaman
          </h2>
          <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
            Halaman ini mengalami kendala teknis saat memuat data. Anda dapat memuat ulang tampilan atau kembali ke halaman utama.
          </p>

          {this.state.error && (
            <div className="mb-6 max-w-lg w-full text-left bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 text-xs text-slate-700">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Rincian Diagnostik:</span>
                <span className="font-mono text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                  {this.state.error.name}
                </span>
              </div>
              <p className="font-mono text-[11px] text-slate-600 break-words">
                {this.state.error.message}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Muat Ulang Halaman</span>
            </button>
            <a
              href="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Kembali ke Dashboard</span>
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
