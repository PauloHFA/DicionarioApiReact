import React from 'react';
import styled from '@emotion/styled';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
  background-color: #f8f9fa;
  
  h2 {
    color: #dc3545;
    margin-bottom: 1rem;
    font-size: 2rem;
    font-weight: 700;
  }
  
  p {
    font-size: 1.2rem;
    color: #4a5568;
    margin-bottom: 2rem;
  }
  
  button {
    margin-top: 1rem;
    padding: 1rem 2rem;
    background-color: #2c5282;
    color: white;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    
    &:hover {
      background-color: #2a4365;
      transform: translateY(-1px);
    }
  }
`;

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <h2>Algo deu errado!</h2>
          <p>Desculpe pelo inconveniente. Por favor, tente novamente.</p>
          <button onClick={() => window.location.reload()}>Recarregar Página</button>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
} 