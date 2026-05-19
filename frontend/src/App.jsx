import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import AppRoutes from './routes/AppRoutes';
import AuthBootstrap from './components/AuthBootstrap';
import { useThemeInit } from './hooks/useThemeInit';
import { logout } from './redux/slices/authSlice';

function ThemedApp() {
  const dispatch = useDispatch();
  useThemeInit();

  useEffect(() => {
    const onLogout = () => dispatch(logout());
    window.addEventListener('auth:logout', onLogout);
    return () => window.removeEventListener('auth:logout', onLogout);
  }, [dispatch]);

  return (
    <AuthBootstrap>
      <AppRoutes />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </AuthBootstrap>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ThemedApp />
      </BrowserRouter>
    </Provider>
  );
}
