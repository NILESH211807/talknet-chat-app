import React, { useEffect, useRef, useState } from 'react';
import { BsThreeDotsVertical } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa';
import ChatItem from './ChatItem';
import Profile from './Profile';
import CreateGroup from './CreateGroup';
import Menu from './Menu';
import { useAuth } from '../context/Auth';
import { useChat } from '../context/Chats';
import SearchUser from './SearchUser';
import ConfirmLogout from './ConfirmLogout';
import { getSocket } from '../context/socket';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

interface Chat {
    chatId: string;
    unread: number;
}

const ChatList: React.FC = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [IsLogoutOpen, setIsLogoutOpen] = useState<boolean>(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { user } = useAuth();
    const { myAllChats } = useChat();
    const socket = getSocket();
    const queryClient = useQueryClient();
    const { id } = useParams();


    useEffect(() => {
        if (socket) {
            socket.on('UNREAD_COUNT', (data) => {
                if (data.chatId === id) return;
                const chat = queryClient.getQueryData<{ data: Chat[] }>(['MY_CHATS']);

                const updatedChat = chat?.data?.map((chat) => {
                    if (chat.chatId === data.chatId) {
                        return {
                            ...chat,
                            unread: data.unread,
                        };
                    }
                    return chat;
                });

                queryClient.setQueryData(['MY_CHATS'], { data: updatedChat });
            });
        }
    }, [socket]);

    return (
        <div className="w-[380px] max-[700px]:w-full h-screen bg-[var(--bg-primary)] border-r border-[var(--border-primary)]">
            {/* Header */}
            <div className="py-3 px-2 flex items-center justify-between border-b border-[var(--border-primary)]">
                <div className='flex items-center justify-center ml-2 rounded-full gap-2'>
                    {user && user?.profile ? (
                        <img src={user?.profile?.image_url} alt={user?.name || user?.username} className='w-8 h-8 rounded-full' />
                    ) : (
                        <FaUser size={18} className='text-[var(--text-secondary)]' />)}
                    <h1 className='text-[var(--text-secondary)] mt-1 capitalize font-bold text-md ml-1'>{user?.name || user?.username}</h1>
                </div>
                <div className="flex items-center gap-4 relative">
                    <button
                        ref={buttonRef}
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-[var(--bg-secondary)] cursor-pointer rounded-full"
                    >
                        <BsThreeDotsVertical className="text-[var(--text-secondary)]" />
                    </button>
                    {showMenu && (
                        <Menu
                            buttonRef={buttonRef as React.RefObject<HTMLButtonElement>}
                            setShowMenu={setShowMenu}
                            setIsCreateGroupOpen={setIsCreateGroupOpen}
                            setIsProfileOpen={setIsProfileOpen}
                            setIsLogoutOpen={setIsLogoutOpen}
                        />
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <SearchUser />
            {/* Chat List */}
            <div className="scrollbar overflow-y-auto h-[calc(100vh-8rem)]">
                {
                    myAllChats && myAllChats.length <= 0 ? (
                        <div className='flex-1 max-[700px]:hidden flex items-center flex-col justify-center text-[var(--text-secondary)]'>
                            <p className='text-md mt-5'>No chats found. Start a new chat.</p>
                        </div>
                    ) : myAllChats.map((chat, index) => (
                        <ChatItem key={index} chat={chat as any} user={user as any} />
                    ))
                }
            </div>

            {/* Modals */}
            <Profile isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
            <CreateGroup
                isOpen={isCreateGroupOpen}
                onClose={() => setIsCreateGroupOpen(false)}
            />

            <ConfirmLogout isOpen={IsLogoutOpen} setIsLogoutOpen={setIsLogoutOpen} />

        </div>
    );
};

export default ChatList;
