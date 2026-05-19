import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from '../redux/slices/authSlice';

export default function AuthBootstrap({ children }) {
  const dispatch = useDispatch();
  const { token, bootstrapped } = useSelector((s) => s.auth);

  useEffect(() => {
    if (token && !bootstrapped) {
      dispatch(fetchMe());
    }
  }, [dispatch, token, bootstrapped]);

  return children;
}
