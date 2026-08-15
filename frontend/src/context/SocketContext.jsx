// /**
//  * SocketContext.jsx
//  * Global Socket.io client provider for Dipto Fashion.
//  * Wraps the entire app so any component can subscribe to real-time events
//  * via the useSocket() hook without needing extra setup.
//  */
// import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
// import { io } from 'socket.io-client';
// import { API_URL } from '../api';

// const SocketContext = createContext(null);

// export const SocketProvider = ({ children }) => {
//   const socketRef = useRef(null);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     // Connect once; reconnect automatically on disconnect
//     const socket = io(API_URL, {
//       transports: ['websocket', 'polling'],
//       reconnectionAttempts: 10,
//       reconnectionDelay: 2000,
//     });

//     socketRef.current = socket;

//     socket.on('connect', () => {
//       console.log('[SOCKET.IO] Connected to backend:', socket.id);
//       setIsConnected(true);
//     });

//     socket.on('disconnect', (reason) => {
//       console.warn('[SOCKET.IO] Disconnected:', reason);
//       setIsConnected(false);
//     });

//     socket.on('connect_error', (err) => {
//       console.warn('[SOCKET.IO] Connection error:', err.message);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// /**
//  * useSocket()
//  * Returns the active socket instance and connection state.
//  * Usage:
//  *   const { socket } = useSocket();
//  *   useEffect(() => {
//  *     if (!socket) return;
//  *     socket.on('product_added', handler);
//  *     return () => socket.off('product_added', handler);
//  *   }, [socket]);
//  */
// export const useSocket = () => useContext(SocketContext);

// export default SocketProvider;














// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { io } from 'socket.io-client';
// import { API_URL } from '../api';

// const SocketContext = createContext({ socket: null, isConnected: false });

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     const socketInstance = io(API_URL, {
//       transports: ['websocket', 'polling'],
//       reconnectionAttempts: 10,
//       reconnectionDelay: 2000,
//     });

//     socketInstance.on('connect', () => {
//       console.log('[SOCKET.IO] Connected:', socketInstance.id);
//       setIsConnected(true);
//     });

//     socketInstance.on('disconnect', (reason) => {
//       console.warn('[SOCKET.IO] Disconnected:', reason);
//       setIsConnected(false);
//     });

//     socketInstance.on('connect_error', (err) => {
//       console.warn('[SOCKET.IO] Connection error:', err.message);
//     });

//     setSocket(socketInstance);

//     return () => {
//       socketInstance.disconnect();
//     };
//   }, []);

//   return (
//     <SocketContext.Provider value={{ socket, isConnected }}>
//       {children}
//     </SocketContext.Provider>
//   );
// };

// // Returns safe context object and fallback
// export const useSocket = () => {
//   const context = useContext(SocketContext);
//   return context || { socket: null, isConnected: false };
// };

// export default SocketProvider;








import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../api';

const SocketContext = createContext({ socket: null, isConnected: false });

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Render Cold-Start Friendly Setup
    const socketInstance = io(API_URL, {
      transports: ['polling', 'websocket'], // Polling first prevents immediate Render socket crash
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
      timeout: 10000,
    });

    socketInstance.on('connect', () => {
      console.log('[SOCKET.IO] Connected:', socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('[SOCKET.IO] Disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[SOCKET.IO] Connecting/Awakening backend:', err.message);
    });

    setSocket(socketInstance);

    return () => {
      if (socketInstance && typeof socketInstance.disconnect === 'function') {
        socketInstance.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

// Safe Context Hook
export const useSocket = () => {
  const context = useContext(SocketContext);
  return context || { socket: null, isConnected: false };
};

export default SocketProvider;