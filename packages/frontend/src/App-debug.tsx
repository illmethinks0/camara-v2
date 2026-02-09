/**
 * Debug version of App component to isolate the error
 */

import React from 'react';

const AppDebug: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#d32f2f' }}>Debug Mode</h1>
      <p>If you see this, the basic React app is working.</p>
      <p>The error is likely in one of the imported components.</p>
    </div>
  );
};

export default AppDebug;