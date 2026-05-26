import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  const depsKey = useMemo(() => JSON.stringify(deps), [deps]);

  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
      return result;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Request failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    run().catch(() => {});
  }, [run, depsKey]);

  return { data, loading, error, refetch: run, setData };
}
