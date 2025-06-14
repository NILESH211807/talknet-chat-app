import { createContext, useContext, useMemo } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext<ReturnType<typeof io> | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const socket = useMemo(() =>
        io(import.meta.env.VITE_API_BASE_URL, { withCredentials: true }), []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}

export const getSocket = () => useContext(SocketContext);
