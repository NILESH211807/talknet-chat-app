import React, { useEffect, useRef } from 'react'
import { BiBlock, BiSearch } from 'react-icons/bi';
import { FaEdit } from 'react-icons/fa';
import { MdDelete, MdModeEdit } from 'react-icons/md';

interface UserMenuProps {
    chatMenuButtonRef: React.RefObject<HTMLButtonElement>;
    setShowChatMenu: (show: boolean) => void;
    setIsGroupEditOpen: (open: boolean) => void;
    data: {
        name: string;
        members: string[];
        isGroup: boolean;
    }
}

const UserMenu: React.FC<UserMenuProps> = ({ chatMenuButtonRef, setShowChatMenu, data, setIsGroupEditOpen }) => {

    const chatMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                chatMenuRef.current &&
                chatMenuButtonRef.current &&
                !chatMenuRef.current.contains(event.target as Node) &&
                !chatMenuButtonRef.current.contains(event.target as Node)
            ) {
                setShowChatMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div
            ref={chatMenuRef}
            className="absolute right-0 top-12 w-48 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-md shadow-lg  z-50">

            {data?.isGroup && <button
                onClick={() => {
                    setIsGroupEditOpen(true);
                    setShowChatMenu(false);
                }}
                className="w-full text-sm font-semibold border-b border-[var(--border-primary)] tracking-wide text-left cursor-pointer px-4 py-3 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center gap-3 transition-colors">
                <FaEdit size={18} />
                Edit Group
            </button>}

            <button
                onClick={() => {
                    setShowChatMenu(false);
                    console.log('Search chat');
                }}
                className="w-full text-sm font-semibold border-b border-[var(--border-primary)] tracking-wide text-left cursor-pointer px-4 py-3 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center gap-3 transition-colors">
                <BiSearch size={18} />
                Search Chat
            </button>

            <button
                onClick={() => {
                    setShowChatMenu(false);
                    console.log('Delete chat');
                }}
                className="w-full text-sm font-semibold border-b border-[var(--border-primary)] tracking-wide text-left cursor-pointer px-4 py-3 hover:bg-[var(--bg-secondary)] text-[var(--red-color)] flex items-center gap-3 transition-colors">
                <MdDelete size={18} />
                Delete Chat
            </button>

            <button
                onClick={() => {
                    setShowChatMenu(false);
                    console.log('Block user');
                }}
                className="w-full text-sm font-semibold border-[var(--border-primary)] tracking-wide text-left cursor-pointer px-4 py-3 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center gap-3 transition-colors">
                <BiBlock size={18} />
                Block User
            </button>
        </div>
    );
}

export default UserMenu
