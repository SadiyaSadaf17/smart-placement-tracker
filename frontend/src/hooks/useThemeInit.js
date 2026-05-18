import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export function useThemeInit() {
  const mode = useSelector((s) => s.theme.mode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    document.documentElement.classList.toggle('light', mode === 'light');
  }, [mode]);
}
