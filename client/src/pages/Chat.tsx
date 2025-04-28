import React from 'react';
import ChatList from '../components/ChatList';

const Chat: React.FC = () => {
    return (
        <div className='w-full h-screen flex bg-[var(--bg-secondary)]'>
            <ChatList />
            <div className='flex-1 max-[700px]:hidden flex items-center flex-col justify-center text-[var(--text-secondary)]'>
                <h1 className='text-4xl font-bold'>TalkNet</h1>
                <p className='text-md mt-2'>Select a chat to start messaging</p>
            </div>
        </div>
    );
};

export default Chat;
