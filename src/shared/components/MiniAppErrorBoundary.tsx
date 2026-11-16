import React from 'react';
import MiniAppErrorView from './MiniAppErrorView';

type Props = {
  name: string;
  onClose: () => void;
  children: React.ReactNode;
};
type State = {error: Error | null};

/** Bắt lỗi crash khi mini app đang chạy (khác với lỗi tải, đã xử lý ở MiniAppHost). */
export default class MiniAppErrorBoundary extends React.Component<Props, State> {
  state: State = {error: null};

  static getDerivedStateFromError(error: Error): State {
    return {error};
  }

  render() {
    const {error} = this.state;
    if (!error) {
      return this.props.children;
    }
    return (
      <MiniAppErrorView
        name={this.props.name}
        message={error.message}
        onRetry={() => this.setState({error: null})}
        onClose={this.props.onClose}
      />
    );
  }
}
