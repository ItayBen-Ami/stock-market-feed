import { useEffect, useState } from 'react';

const eventSources = new Map<string, { es: EventSource; refCount: number }>();

export function useSSE<T>(url: string, valueParser: (value: string) => T = JSON.parse) {
  const [isConnected, setIsConnected] = useState(false);
  const [value, setValue] = useState<T | null>(null);
  const [error, setError] = useState<Event | null>(null);

  useEffect(() => {
    if (!eventSources.has(url)) {
      const es = new EventSource(url);
      eventSources.set(url, { es, refCount: 0 });

      es.onopen = () => setIsConnected(true);
      es.onmessage = (event) => setValue(valueParser(event.data));
      es.onerror = (err) => {
        setError(err);
        setIsConnected(false);

        // Optionally close the connection on certain errors
        if (es.readyState === EventSource.CLOSED) {
          eventSources.delete(url);
        }
      };
    }

    const eventSource = eventSources.get(url);

    if (!eventSource) return;

    eventSource.refCount += 1;

    return () => {
      eventSource.refCount -= 1;

      // Close the EventSource if no more references exist
      if (eventSource.refCount === 0) {
        eventSource.es.close();
        eventSources.delete(url);
      }
    };
  }, [url, valueParser]);

  return { isConnected, value, error };
}
