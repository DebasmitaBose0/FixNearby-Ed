/**
 * useSocketRoom.js
 *
 * A custom React hook that wraps socket.io-client with a guaranteed cleanup
 * path, preventing WebSocket connection leaks when components unmount or the
 * user navigates away from a chat/community page.
 *
 * ## The Leak
 * Without a cleanup, a typical socket setup inside useEffect looks like:
 *
 *   useEffect(() => {
 *     const socket = io(SERVER_URL);
 *     socket.on('message', handler);
 *     // No return — socket is NEVER closed.
 *   }, []);
 *
 * If the user navigates to the Community page and back 10 times, there are
 * now 10 open TCP connections to the server, each holding a listener.  Over
 * time this exhausts server file descriptors and browser connection limits.
 *
 * ## The Fix
 * This hook always returns a cleanup function from useEffect that:
 *   1. Emits a 'leaveRoom' event so the server-side room roster stays accurate.
 *   2. Calls socket.disconnect() to close the WebSocket cleanly.
 *
 * ## Usage
 *
 *   import { useSocketRoom } from '../hooks/useSocketRoom';
 *
 *   const Community = () => {
 *     const { socket, isConnected } = useSocketRoom('community-general');
 *
 *     useEffect(() => {
 *       if (!socket) return;
 *       const handler = (msg) => setMessages(prev => [...prev, msg]);
 *       socket.on('message', handler);
 *       return () => socket.off('message', handler); // ← clean up the listener
 *     }, [socket]);
 *
 *     // ...
 *   };
 *
 * ## Server setup
 * The server must handle the 'joinRoom' and 'leaveRoom' events:
 *
 *   io.on('connection', (socket) => {
 *     socket.on('joinRoom', (room) => socket.join(room));
 *     socket.on('leaveRoom', (room) => socket.leave(room));
 *   });
 *
 * ## Note on the socket.io-client dependency
 * socket.io-client is listed as a peer dependency and must be installed
 * separately in the client package.json:
 *
 *   npm install socket.io-client
 *
 * The hook performs a runtime check and logs a helpful error if the package
 * is absent, so the rest of the app continues to work during the transition.
 */

import { useEffect, useRef, useState } from 'react';

const SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Connect to a Socket.io room and return the socket instance plus a live
 * connection-state boolean.  The connection is automatically cleaned up when
 * the component unmounts or when `roomName` changes.
 *
 * @param {string} roomName - The room to join immediately after connecting.
 * @returns {{ socket: import('socket.io-client').Socket | null, isConnected: boolean }}
 */
export function useSocketRoom(roomName) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let socket;

    const connect = async () => {
      try {
        // Dynamic import so the app still bundles even if the package is absent
        const { io } = await import('socket.io-client');

        socket = io(SERVER_URL, {
          // Reconnect with exponential back-off; cap at 5 attempts to avoid
          // infinite polling when the server is intentionally offline.
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 10000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
          setIsConnected(true);
          if (roomName) socket.emit('joinRoom', roomName);
        });

        socket.on('disconnect', () => setIsConnected(false));
        socket.on('connect_error', (err) => {
          console.warn('[useSocketRoom] Connection error:', err.message);
        });
      } catch (err) {
        console.error(
          '[useSocketRoom] socket.io-client not found. Run: npm install socket.io-client',
          err
        );
      }
    };

    connect();

    // ─── CLEANUP ──────────────────────────────────────────────────────────────
    // This return function is the critical piece that prevents leaks.
    // React runs it when the component unmounts or when roomName changes.
    return () => {
      if (socket) {
        if (roomName) socket.emit('leaveRoom', roomName);
        socket.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [roomName]); // Re-run only when the target room changes

  return { socket: socketRef.current, isConnected };
}
