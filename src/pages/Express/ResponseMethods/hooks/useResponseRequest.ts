import { useEffect, useRef, useState } from 'react';

export type Result = {
  status: number;
  statusText: string;
  contentType: string;
  disposition: string;
  location: string;
  body: string;
};

export const useResponseRequest = () => {
  const controllerRef = useRef<AbortController | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const reset = () => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setResult(null);
    setError('');
    setLoading(false);
  };

  const run = async (url: string) => {
    controllerRef.current?.abort();
    const controller = new AbortController();

    controllerRef.current = controller;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(url, { redirect: 'manual', signal: controller.signal });
      const body = await response.text();

      if (controllerRef.current !== controller) {
        return;
      }

      setResult({
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type') ?? '—',
        disposition: response.headers.get('content-disposition') ?? '—',
        location: response.headers.get('location') ?? '—',
        body,
      });
    } catch {
      if (controllerRef.current === controller && !controller.signal.aborted) {
        setError('请求失败。请确认后端已在 localhost:3000 启动。');
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setLoading(false);
      }
    }
  };

  return { result, error, loading, reset, run };
};
