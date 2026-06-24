import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAuthStore } from './stores/authStore';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Refresh user details from server if token is saved on startup
    checkAuth();
  }, [checkAuth]);

  return <RouterProvider router={router} />;
}

export default App;
