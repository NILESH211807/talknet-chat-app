import { useEffect } from "react";

// Proper type for event handlers
interface EventHandlers {
    [event: string]: (...args: any[]) => void;
}

export const useSocketEvents = (socket: any, eventHandlers: EventHandlers) => {
    useEffect(() => {
        if (!socket) return;

        // Add event listeners
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        // Cleanup function to remove event listeners
        return () => {
            Object.entries(eventHandlers).forEach(([event, handler]) => {
                socket.off(event, handler);
            });
        };
    }, [socket, eventHandlers]);
};