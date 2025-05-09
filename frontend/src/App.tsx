import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { initializeIcons } from '@fluentui/react';


import Chat from './pages/chat/Chat';
import Layout from './pages/layout/Layout';
import NoPage from './pages/NoPage';
import { AppStateProvider } from './state/AppProvider';
import { jwtDecode } from "jwt-decode";

import './index.css';
import PleaseLogin from './pages/PleaseLogin'

initializeIcons();

interface JwtPayload {
  name?: string;
  [key: string]: any;
}

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
          localStorage.setItem('user', token);
          return true;
        } else {

          const fuVal = await fetch('https://videnbarometer.dk/util/fu/jwt/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            }
          });

          if (fuVal.status === 200) {
            setIsValid(true);
            localStorage.setItem('token', token); // Gem token i localStorage

            const decoded: JwtPayload = jwtDecode<JwtPayload>(token);
            const userName = decoded.name ?? 'Ukendt bruger';
            localStorage.setItem('user', userName);
            return true;
          } else {
            setIsValid(false);
            localStorage.removeItem('token'); // Slet ugyldigt token
            localStorage.removeItem('user'); // Slet ugyldigt token
            return false;
          }

        }
      } catch (error) {
        setIsValid(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
