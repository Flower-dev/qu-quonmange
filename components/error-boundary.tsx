'use client';
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

export class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error(error, info); }
  render() {
    if (this.state.hasError) return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center animate-fade-up">
          <span className="text-5xl block mb-4">🍽️</span>
          <p className="text-text-secondary mb-4">Quelque chose s&apos;est mal passé.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-accent text-white hover:bg-accent-dark transition-colors">Rafraîchir</button>
        </div>
      </div>
    );
    return this.props.children;
  }
}
