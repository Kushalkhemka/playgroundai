import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Demo } from './components/Demo';

function App() {
  return (
    <div className="h-screen bg-black">
      <Demo />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #475569',
          },
        }}
      />
    </div>
  );
}

export default App;