import { useEffect, useState } from 'react';

const sockets = new Map<string, { ws: WebSocket; refCount: number }>();

export function useWebsocket<T>(url: string, valueParser: (value: string) => T = JSON.parse) {
  const [isReady, setIsReady] = useState(false);
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    if (!sockets.has(url)) {
      const ws = new WebSocket(url);
      sockets.set(url, { ws, refCount: 0 });

      ws.onopen = () => setIsReady(true);
      ws.onmessage = event => setValue(valueParser(event.data));
      ws.onclose = () => {
        sockets.delete(url);
      };
    }

    const socket = sockets.get(url);

    if (!socket) return;

    socket.refCount += 1;

    return () => {
      socket.refCount -= 1;

      // Close the WebSocket if no more references exist
      if (socket.refCount === 0 && socket.ws.OPEN) {
        socket.ws.close();
        sockets.delete(url);
      }
    };
  }, [url]);

  const send = (data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView) => {
    const socket = sockets.get(url);
    if (socket && socket.ws.readyState === WebSocket.OPEN) {
      socket.ws.send(data);
    }
  };

  return { isReady, value, send };
}
