import React, { useState, useRef, useEffect, Ref } from 'react'
import { FaPaperclip, FaPaperPlane, FaImage, FaVideo, FaFile, FaMicrophone, FaFilePdf, FaFileWord, FaFileAlt, FaFileExcel, FaFilePowerpoint } from 'react-icons/fa'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { IoArrowBack } from 'react-icons/io5'
import { BiSearch, BiBlock } from 'react-icons/bi';
import { MdDelete } from 'react-icons/md';
import ChatList from '../components/ChatList'
import { useNavigate, useParams } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import Video from '../components/message-types/Video';
import Audio from '../components/message-types/Audio';
import Document from '../components/message-types/Document';
import Image from '../components/message-types/Image';
import { useQuery } from '@tanstack/react-query';
import { useAxios } from '../hook/useAxios';

interface Message {
    id: number;
    text?: string;
    image?: string;
    video?: string;
    audio?: string;
    document?: string;
    sender: 'me' | 'other';
    timestamp: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'document';
}


// {
//     "success": true,
//     "data": {
//         "_id": "680e4fe747d99fd48bbf1d84",
//         "name": "Rodolfo Purdy",
//         "isGroup": false,
//         "members": [
//             {
//                 "_id": "680e05721a62b63153282f63",
//                 "name": "Rodolfo Purdy"
//             },
//             {
//                 "_id": "680de2689ed0ffc885ad157d",
//                 "name": "NILESH KUMAR"
//             }
//         ],
//         "createdAt": "2025-04-27T15:40:23.994Z",
//         "updatedAt": "2025-04-27T15:40:23.994Z"
//     }
// }

const getFileIcon = (fileName: string | undefined) => {
    if (!fileName) return FaFileAlt;
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf':
            return FaFilePdf;
        case 'doc':
        case 'docx':
            return FaFileWord;
        case 'xls':
        case 'xlsx':
            return FaFileExcel;
        case 'ppt':
        case 'pptx':
            return FaFilePowerpoint;
        case 'txt':
            return FaFileAlt;
        default:
            return FaFileAlt;
    }
};

const getFileTypeLabel = (fileName: string | undefined) => {
    if (!fileName) return 'Document';
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf':
            return 'PDF Document';
        case 'doc':
        case 'docx':
            return 'Word Document';
        case 'xls':
        case 'xlsx':
            return 'Excel Spreadsheet';
        case 'ppt':
        case 'pptx':
            return 'PowerPoint Presentation';
        case 'txt':
            return 'Text Document';
        default:
            return 'Document';
    }
};

const Messages: React.FC = () => {
    const [message, setMessage] = useState('')
    const [showAttachMenu, setShowAttachMenu] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const attachMenuRef = useRef<HTMLDivElement>(null)
    const attachButtonRef = useRef<HTMLButtonElement>(null);
    const { id } = useParams();
    const { fetchData } = useAxios();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const { data, isPending, error } = useQuery({
        queryKey: ['CHAT_ID', id],
        queryFn: async () => await fetchData({
            method: 'GET',
            url: `/api/chat/${id}`,
            params: { populate: 'true' }
        }),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!id,
        refetchOnWindowFocus: false,
    });


    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hey, how are you?", sender: 'other', timestamp: '10:00 AM', type: 'text' },
        { id: 2, text: "I'm good, thanks! How about you?", sender: 'me', timestamp: '10:02 AM', type: 'text' },
        {
            id: 3,
            image: "https://picsum.photos/400/300",
            sender: 'other',
            timestamp: '10:03 AM',
            type: 'image'
        },
        { id: 4, text: "Just working on some new features. The project is coming along nicely.", sender: 'other', timestamp: '10:05 AM', type: 'text' },
        {
            id: 5,
            image: "https://picsum.photos/400/300?random=1",
            sender: 'me',
            timestamp: '10:06 AM',
            type: 'image'
        },
        { id: 6, text: "That's great to hear! Would you like to discuss the details over a call?", sender: 'me', timestamp: '10:07 AM', type: 'text' },
        { id: 7, text: "Sure, I'm available in about an hour. Would that work for you?", sender: 'other', timestamp: '10:10 AM', type: 'text' },
    ])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                attachMenuRef.current &&
                attachButtonRef.current &&
                !attachMenuRef.current.contains(event.target as Node) &&
                !attachButtonRef.current.contains(event.target as Node)
            ) {
                setShowAttachMenu(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!message.trim() && !selectedFile) return

        const now = new Date()
        const timestamp = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })

        let newMessages: Message[] = [];

        if (selectedFile) {
            const fileUrl = await handleFileUpload(selectedFile)
            const fileType = selectedFile.type.split('/')[0]

            const isDocument = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain'
            ].includes(selectedFile.type)

            const fileMessage: Message = {
                id: messages.length + 1,
                sender: 'me',
                timestamp,
                type: isDocument ? 'document' : (fileType as 'image' | 'video' | 'audio')
            }

            if (fileType === 'image') fileMessage.image = fileUrl
            if (fileType === 'video') fileMessage.video = fileUrl
            if (fileType === 'audio') fileMessage.audio = fileUrl
            if (isDocument) fileMessage.text = selectedFile.name

            newMessages.push(fileMessage)
        }

        if (message.trim()) {
            const textMessage: Message = {
                id: messages.length + 1 + newMessages.length,
                text: message,
                sender: 'me',
                timestamp,
                type: 'text'
            }
            newMessages.push(textMessage)
        }

        setMessages([...messages, ...newMessages])
        setMessage('')
        setSelectedFile(null)
    }

    const handleFileUpload = async (file: File): Promise<string> => {
        // Simulate file upload to server
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => {
                // In real application, you would upload to server and get URL
                resolve(reader.result as string)
            }
            reader.readAsDataURL(file)
        })
    }

    const handleFileSelect = (type: string) => {
        const fileInput = document.createElement('input')
        fileInput.type = 'file'

        switch (type) {
            case 'image':
                fileInput.accept = 'image/*'
                break
            case 'video':
                fileInput.accept = 'video/*'
                break
            case 'audio':
                fileInput.accept = 'audio/*'
                break
            case 'document':
                fileInput.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx'
                break
        }

        fileInput.click()
        fileInput.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0]
            if (file) {
                setSelectedFile(file)
                setShowAttachMenu(false)
            }
        }
    }

    const renderMessage = (msg: Message) => {
        return (
            <div
                key={msg.id}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div
                    className={`max-w-[70%] max-[480px]:max-w-[85%] border border-[var(--border-primary)] p-3 rounded-sm ${msg.sender === 'me'
                        ? 'bg-[var(--btn-primary)] text-white rounded-br-none'
                        : 'bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-bl-none'
                        }`}>
                    {msg.type === 'image' && <Image msg={msg} />}
                    {msg.type === 'video' && <Video msg={msg} />}
                    {msg.type === 'audio' && <Audio msg={msg} />}
                    {msg.type === 'document' && <Document msg={msg} />}

                    {msg.text && msg.type === 'text' && <p>{msg.text}</p>}
                    <span className={`text-xs ${msg.sender === 'me' ? 'text-[#ffffff90]' : 'text-[var(--text-secondary)]'} block mt-1`}>
                        {msg.timestamp}
                    </span>
                </div>
            </div>
        )
    }

    const [showChatMenu, setShowChatMenu] = useState(false);
    const chatMenuButtonRef = useRef<HTMLButtonElement>(null);

    return (
        <div className='w-full h-screen flex'>
            {/* ChatList - Hide on mobile when showing messages */}
            <div className='w-[380px] max-[768px]:w-full max-[768px]:hidden'>
                <ChatList />
            </div>

            {/* Messages Section */}
            <div className='flex-1 flex flex-col h-screen bg-[var(--bg-secondary)] max-[768px]:w-full'>
                {/* Header */}
                <div className='bg-[var(--bg-primary)] py-2 px-4 flex items-center justify-between border-b border-[var(--border-primary)]'>
                    <div className='flex items-center gap-3'>
                        {/* Back button for mobile */}
                        <button onClick={() => navigate(-1)} className='p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors hidden max-[768px]:block'>
                            <IoArrowBack className='text-[var(--text-secondary)]' />
                        </button>

                        <div className='relative'>
                            <div className='w-10 h-10 rounded-full overflow-hidden'>
                                <img
                                    src="https://i.pravatar.cc/150?img=1"
                                    alt="Profile"
                                    className='w-full h-full object-cover'
                                />
                            </div>
                            <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--bg-primary)]'></div>
                        </div>
                        <div>
                            <div className='flex items-center gap-2'>
                                <h3 className='font-semibold text-[var(--text-primary)]'>{data?.data?.name}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <button
                            ref={chatMenuButtonRef}
                            onClick={() => setShowChatMenu(!showChatMenu)}
                            className='p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors'>
                            <BsThreeDotsVertical className='text-[var(--text-secondary)]' />
                        </button>

                        {/* Chat Menu */}
                        {showChatMenu && (
                            <UserMenu
                                chatMenuButtonRef={chatMenuButtonRef as React.RefObject<HTMLButtonElement>}
                                setShowChatMenu={setShowChatMenu}
                            />
                        )}
                    </div>
                </div>

                {/* Messages Container */}
                <div className='flex-1 overflow-y-auto p-4 space-y-4'>
                    {messages.map((msg) => renderMessage(msg))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className='bg-[var(--bg-primary)] p-4 border-t border-[var(--border-primary)]'>
                    {selectedFile && (
                        <div className="mb-2 p-2 bg-[var(--bg-secondary)] rounded-sm flex items-center justify-between">
                            <span className="text-sm text-[var(--text-secondary)]">
                                Selected file: {selectedFile.name}
                            </span>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="text-red-500 text-sm hover:text-red-600"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className='flex items-center gap-2'>
                        <div className='relative'>
                            <button
                                ref={attachButtonRef}
                                type='button'
                                onClick={() => setShowAttachMenu(!showAttachMenu)}
                                className='p-2 cursor-pointer hover:bg-[var(--bg-secondary)] rounded-full text-[var(--text-secondary)] transition-colors'
                            >
                                <FaPaperclip />
                            </button>

                            {/* Attachment Menu */}
                            {showAttachMenu && (
                                <div
                                    ref={attachMenuRef}
                                    className='absolute bottom-12 left-0 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg shadow-lg py-2 min-w-[160px]'
                                >
                                    <button
                                        onClick={() => handleFileSelect('image')}
                                        className='w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center gap-3 transition-colors cursor-pointer'
                                    >
                                        <FaImage /> Image
                                    </button>
                                    <button
                                        onClick={() => handleFileSelect('video')}
                                        className='w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center gap-3 transition-colors cursor-pointer'
                                    >
                                        <FaVideo /> Video
                                    </button>
                                    <button
                                        onClick={() => handleFileSelect('audio')}
                                        className='w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center gap-3 transition-colors cursor-pointer'
                                    >
                                        <FaMicrophone /> Audio
                                    </button>
                                    <button
                                        onClick={() => handleFileSelect('document')}
                                        className='w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center gap-3 transition-colors cursor-pointer'
                                    >
                                        <FaFile /> Document
                                    </button>
                                </div>
                            )}
                        </div>

                        <input
                            type='text'
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder='Type a message'
                            className='flex-1 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-full px-4 py-2 outline-none border border-[var(--border-primary)] focus:border-[var(--btn-primary)] transition-colors'
                        />

                        <button
                            type='submit'
                            disabled={!message.trim() && !selectedFile}
                            className='p-2 bg-[var(--btn-primary)] hover:bg-[var(--btn-secondary)] disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white transition-colors cursor-pointer'>
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Messages
