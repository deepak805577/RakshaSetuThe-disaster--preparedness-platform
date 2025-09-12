import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AuthDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading, token } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'black',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px',
      fontFamily: 'monospace'
    }}>
      <h4 style={{ margin: '0 0 5px 0', color: '#ffd700' }}>Auth Debug Info</h4>
      <div><strong>Is Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
      <div><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
      <div><strong>Has Token:</strong> {token ? 'Yes' : 'No'}</div>
      <div><strong>User Name:</strong> {user?.name || 'None'}</div>
      <div><strong>User Role:</strong> {user?.role || 'None'}</div>
      <div><strong>User Email:</strong> {user?.email || 'None'}</div>
      {token && (
        <div style={{ marginTop: '5px', wordBreak: 'break-all' }}>
          <strong>Token:</strong> {token.substring(0, 50)}...
        </div>
      )}
    </div>
  );
};

export default AuthDebug;
