import React, { useEffect, useRef } from 'react';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { RxExit } from 'react-icons/rx';
import { User } from '../types/User';

interface UserMenuProps {
    chatMenuButtonRef: React.RefObject<HTMLButtonElement>;
    setShowChatMenu: (show: boolean) => void;
    setIsGroupEditOpen: (open: boolean) => void;
    setIsDeleteOpen: (open: boolean) => void;
    setIsLeaveOpen: (open: boolean) => void;
    setIsRemoveChatOpen: (open: boolean) => void;
    data: {
        name: string;
        members: string[];
        isGroup: boolean;
        creator: User;
    },
    user: User | null;
}

const UserMenu: React.FC<UserMenuProps> = ({
    chatMenuButtonRef,
    setShowChatMenu,
    data,
    setIsGroupEditOpen,
    setIsDeleteOpen,
    setIsLeaveOpen,
    setIsRemoveChatOpen,
    user
}) => {

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

            {data?.isGroup && data.creator._id == user?._id && <button
                onClick={() => {
                    setIsGroupEditOpen(true);
                    setShowChatMenu(false);
                }}
                className="w-full text-sm font-semibold border-b border-[var(--border-primary)] tracking-wide text-left cursor-pointer px-4 py-3 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center gap-3 transition-colors">
                <FaEdit size={18} />
                Edit Group
            </button>}


            {data?.isGroup && data.creator._id != user?._id && (
                <button
                    onClick={() => {
                        setIsLeaveOpen(true);
                        setShowChatMenu(false);
                    }}
                    className="w-full text-sm font-semibold tracking-wide text-left cursor-pointer px-4 py-3 hover:bg-[var(--bg-secondary)] text-[var(--red-color)] flex items-center gap-3 transition-colors">
                    <RxExit size={18} />
                    Leave Group
                </button>)}

            {data?.isGroup && data.creator._id == user?._id &&
                <button
                    onClick={() => {
                        setIsDeleteOpen(true);
                        setShowChatMenu(false);
                    }}
                    className="w-full text-sm font-semibold tracking-wide text-left cursor-pointer px-4 py-3 hover:bg-[var(--bg-secondary)] text-[var(--red-color)] flex items-center gap-3 transition-colors">
                    <MdDelete size={18} />
                    Delete Group
                </button>
            }

            {!data?.isGroup &&
                <button
                    onClick={() => {
                        setIsRemoveChatOpen(true);
                        setShowChatMenu(false);
                    }}
                    className="w-full text-sm font-semibold tracking-wide text-left cursor-pointer px-4 py-3 hover:bg-[var(--bg-secondary)] text-[var(--red-color)] flex items-center gap-3 transition-colors">
                    <MdDelete size={18} />
                    Remove User
                </button>
            }
        </div>
    );
}

export default UserMenu
