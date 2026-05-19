import { useCallback, useEffect, useState } from 'react';

export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Request failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    run().catch(() => {});
  }, [run]);

  return { data, loading, error, refetch: run, setData };
}
