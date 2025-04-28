import { useQuery } from "@tanstack/react-query";
import React from "react";
import { createContext, useContext } from "react";
import { useAxios } from "../hook/useAxios";

interface Chat {
    chatId: string;
    name: string;
    lastMessage?: string;
    time?: string;
    unreadCount?: number;
    avatar?: string;
}


interface ChatContextType {
    myAllChats: Chat[];
    loading: boolean;
}

// Create a Context with proper type
const ChatContext = createContext<ChatContextType>({
    myAllChats: [],
    loading: false
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { fetchData } = useAxios();

    const { data: chats, isPending } = useQuery({
        queryKey: ['MY_CHATS'],
        queryFn: async () => await fetchData({
            method: 'GET',
            url: '/api/chat/my-chats'
        }),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    const values = {
        myAllChats: chats?.data || [],
        loading: isPending,
    }

    return (
        <ChatContext.Provider value={values}>
            {children}
        </ChatContext.Provider>
    )
}

export const useChat = (): ChatContextType => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}

export default ChatContext;
