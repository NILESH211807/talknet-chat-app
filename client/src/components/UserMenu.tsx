import React, { useEffect, useRef } from 'react'
import { BiBlock, BiSearch } from 'react-icons/bi';
import { MdDelete } from 'react-icons/md';

interface UserMenuProps {
    chatMenuButtonRef: React.RefObject<HTMLButtonElement>;
    setShowChatMenu: (show: boolean) => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ chatMenuButtonRef, setShowChatMenu }) => {

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



    // const handleSearchChat = () => {
    //     setShowChatMenu(false);
    //     // Implement search functionality
    //     console.log('Search chat');
    // };

    // const handleDeleteChat = () => {
    //     setShowChatMenu(false);
    //     // Implement delete functionality
    //     console.log('Delete chat');
    // };

    // const handleBlockUser = () => {
    //     setShowChatMenu(false);
    //     // Implement block functionality
    //     console.log('Block user');
    // };


    return (
        <div
            ref={chatMenuRef}
            className="absolute right-0 top-12 w-48 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-md shadow-lg py-2 z-50"
        >
            <button
                onClick={() => {
                    setShowChatMenu(false);
                    console.log('Search chat');
                }}
                className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center gap-3 transition-colors">
                <BiSearch size={18} />
                Search Chat
            </button>

            <button
                onClick={() => {
                    setShowChatMenu(false);
                    console.log('Delete chat');
                }}
                className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] text-red-500 flex items-center gap-3 transition-colors">
                <MdDelete size={18} />
                Delete Chat
            </button>

            <button
                onClick={() => {
                    setShowChatMenu(false);
                    console.log('Block user');
                }}
                className="w-full text-left px-4 py-3 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center gap-3 transition-colors"
            >
                <BiBlock size={18} />
                Block User
            </button>
        </div>
    );
}

export default UserMenu
