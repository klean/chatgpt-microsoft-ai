import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { initializeIcons } from '@fluentui/react';


import Chat from './pages/chat/Chat';
import Layout from './pages/layout/Layout';
import NoPage from './pages/NoPage';
import { AppStateProvider } from './state/AppProvider';

import './index.css';
import PleaseLogin from './pages/PleaseLogin'

initializeIcons();

function App() {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {

    const validateToken = async (token: string) => {
      try {
        const response = await fetch('https://access-token-validator.square-union-6da7.workers.dev/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (response.status === 200) {
          setIsValid(true);
          localStorage.setItem('token', token); // Gem token i localStorage
          return true;
        } else {
          setIsValid(false);
          localStorage.removeItem('token'); // Slet ugyldigt token
          return false;
        }
      } catch (error) {
        setIsValid(false);
        localStorage.removeItem('token');
        return false;
      }
    };

    const checkToken = async () => {
      const urlParams = new URLSearchParams(location.search);
      const urlToken = urlParams.get('token');
      const storedToken = localStorage.getItem('token');

      if (urlToken) {
        const isValidToken = await validateToken(urlToken);
        urlParams.delete('token');
        navigate('/', { replace: true });
        return;
      }

      if (storedToken) {
        await validateToken(storedToken);
        return;
      }

      setIsValid(false);
    };

    checkToken();
  }, [location, navigate]);

  if (isValid === null) {
    return <div>Loading...</div>;
  }

  return isValid ? (
    <AppStateProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Chat />} />
          <Route path="*" element={<PleaseLogin />} />
        </Route>
      </Routes>
    </AppStateProvider>
  ) : (
      <AppStateProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<PleaseLogin />} />
          </Route>
        </Routes>
      </AppStateProvider>
  );
}

export default App;
