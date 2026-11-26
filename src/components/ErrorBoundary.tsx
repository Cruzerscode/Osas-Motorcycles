import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { FIREBASE_CONFIG } from '../firebase';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
  isQuotaExceeded: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
      isQuotaExceeded: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const raw = error?.message || 'An unexpected error occurred.';
    const isQuota =
      raw.includes('Quota exceeded') || raw.includes('resource-exhausted');

    let friendly = raw;
    try {
      const parsed = JSON.parse(raw) as {
        error?: string;
        operationType?: string;
        path?: string;
      };
      if (parsed?.error) {
        friendly = `${parsed.error}${
          parsed.path ? ` (${parsed.operationType ?? 'read'} on ${parsed.path})` : ''
        }`;
      }
    } catch {
      // plain string message
    }

    return {
      hasError: true,
      errorMessage: friendly,
      isQuotaExceeded: isQuota,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const upgradeUrl = `https://console.firebase.google.com/project/${FIREBASE_CONFIG.projectId}/firestore/databases/${FIREBASE_CONFIG.firestoreDatabaseId}/data?openUpgradeDialog=true`;

    return (
      <div className="min-h-screen studio-page-backdrop flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl p-7 shadow-xl border border-black/[0.06] text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#DC2626] mx-auto inline-flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h1 className="text-[20px] font-bold text-[#18181B]">
            {this.state.isQuotaExceeded
              ? 'Database Daily Quota Reached'
              : 'Showroom Data Sync Interrupted'}
          </h1>
          <p className="text-[13.5px] text-[#52525B] leading-relaxed">
            {this.state.isQuotaExceeded
              ? 'Free daily Firestore read quota has been reached and resets tomorrow.'
              : this.state.errorMessage}
          </p>
          {this.state.isQuotaExceeded && (
            <a
              href={upgradeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[12.5px] font-semibold text-[#DC2626] underline underline-offset-4"
            >
              View Firestore Database Plan in Firebase Console
            </a>
          )}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#18181B] hover:bg-[#DC2626] text-white text-[13.5px] font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Showroom</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
}
