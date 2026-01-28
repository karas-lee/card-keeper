"use client";

import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <div className="mb-4 rounded-full bg-red-100 p-3">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            문제가 발생했습니다
          </h3>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {this.state.error?.message || "알 수 없는 오류가 발생했습니다."}
          </p>
          <Button onClick={this.handleRetry} variant="outline" className="mt-4">
            다시 시도
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
