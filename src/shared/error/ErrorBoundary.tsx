/**
 * @author 김대호
 * @description 에러 바운드리 컴포넌트 - React 컴포넌트 트리에서 발생하는 에러를 포협하여 처리
 * 자식 컴포넌트에서 발생한 에러를 감지하고 fallback UI를 표시하여 전체 앱 충돌 방지
 * 커스텀 에러 핸들러와 fallback UI를 지원하며, 에러 복구 기능 제공
 * 에러 발생 시 콘솔 로그로 디버깅 정보 기록
 */

import { Component, type ReactNode, type ErrorInfo } from 'react';
import ErrorFallback from './ErrorFallback';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, resetError: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * @class ErrorBoundary
 * @description 에러 바운드리 클래스 컴포넌트 - React 에러 경계 처리
 * @extends {Component<ErrorBoundaryProps, ErrorBoundaryState>}
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 에러 로깅
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 외부 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // 커스텀 fallback이 있으면 에러와 reset 함수 전달
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // 기본 ErrorFallback 컴포넌트 사용
      return <ErrorFallback error={this.state.error} resetError={this.handleReset} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
