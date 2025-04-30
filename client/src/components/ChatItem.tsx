import React from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    profile?: { image_url: string, public_id: string };
}

interface ChatItemProps {
    name: string;
    chatId: string;
    isGroup: boolean;
    members: User[];
    createdAt?: string;
    updatedAt?: string;
    profile?: { image_url: string, public_id: string };
}

interface ChatItemComponentProps {
    chat: ChatItemProps;
    user: User;
}

const ChatItem: React.FC<ChatItemComponentProps> = ({ chat, user }) => {
    const navigate = useNavigate();
    const { id } = useParams();
    // Filter out the current user from members to show other user's profile
    const otherUser = chat.members.find(member => member._id !== user._id);

    return (
        <div onClick={() => navigate(`/chat/${chat.chatId}`)} className={`flex items-center gap-3 p-3 hover:bg-[var(--bg-secondary)] cursor-pointer transition-all ${chat?.chatId === id ? 'bg-[var(--bg-secondary)]' : ''}`}>
            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                {chat?.isGroup ? <>
                    {chat?.profile && chat?.profile?.image_url ? (
                        <img src={chat?.profile?.image_url} alt={chat.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-[var(--bg-secondary)] flex items-center justify-center">
                            <span className="text-[var(--text-secondary)] text-2xl">G</span>
                        </div>
                    )}
                </> : (
                    otherUser?.profile ? (
                        <img src={otherUser.profile.image_url} alt={chat.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-[var(--bg-secondary)] flex items-center justify-center">
                            <span className="text-[var(--text-secondary)] text-2xl">{chat.name.charAt(0)}</span>
                        </div>
                    )
                )}
            </div>

            {/* Chat Info */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-[15px] text-[var(--text-primary)] truncate">{chat?.name}</h3>
                    <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">7:00 AM</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] truncate">No messages yet</p>
            </div>

            {/* Unread Count */}
            <div className="bg-[var(--btn-primary)] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                5
            </div>
            {/* {unreadCount && unreadCount > 0 && (
                <div className="bg-[var(--btn-primary)] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {unreadCount}
                </div>
            )} */}
        </div>
    );
}

export default ChatItem
