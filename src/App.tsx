import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { keepAliveService } from './services/backendApi';

function App() {
  useEffect(() => {
    // Keep-alive function to prevent Render server from sleeping
    const keepAlive = () => {
      keepAliveService.ping();
    };

    // Ping immediately when app loads
    keepAlive();

    // Set up interval to ping every 10 minutes (600000 ms)
    // This ensures the server stays awake (Render sleeps after 15 min of inactivity)
    const intervalId = setInterval(keepAlive, 10 * 60 * 1000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return <RouterProvider router={router} />;
}

export default App;