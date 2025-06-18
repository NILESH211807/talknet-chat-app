import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { FaPaperclip, FaPaperPlane, FaImage, FaVideo, FaMicrophone, FaFile } from 'react-icons/fa'
import { BsThreeDotsVertical } from 'react-icons/bs'
import { IoArrowBack } from 'react-icons/io5'
import ChatList from '../components/ChatList'
import { useNavigate, useParams } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAxios } from '../hook/useAxios';
import GroupEdit from '../components/GroupEdit';
import { getSocket } from '../context/socket';
import { useSocketEvents } from '../hook/useSocketEvents';
import RenderMessage from '../components/RenderMessage';
import { useAuth } from '../context/Auth';
import { allMessage, newMessages } from '../types/message';
import toast from 'react-hot-toast'
import { attachmentUpload } from '../helper/uploader'
import Loader from '../components/Loader'
import ConfirmDeleteGroup from '../components/ConfirmDeleteGroup';
import ConfirmLeaveGroup from '../components/ConfirmLeaveGroup';
import ConfirmRemoveChat from '../components/ConfirmRemoveChat';

interface Chat {
    chatId: string;
    unread: number;
}

const Messages = () => {

    const [message, setMessage] = useState('')
    const [showAttachMenu, setShowAttachMenu] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const attachMenuRef = useRef<HTMLDivElement>(null)
    const attachButtonRef = useRef<HTMLButtonElement>(null);
    const { id } = useParams();
    const { fetchData } = useAxios();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [isGroupEditOpen, setIsGroupEditOpen] = useState(false);
    const socket = getSocket();
    const { user } = useAuth();
    const [showChatMenu, setShowChatMenu] = useState(false);
    const chatMenuButtonRef = useRef<HTMLButtonElement>(null);
    const { imageUpload, audioUpload, videoUpload } = attachmentUpload();
    const [isLoading, setIsLoading] = useState<Boolean>(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
    const [isLeaveOpen, setIsLeaveOpen] = useState<boolean>(false);
    const [isRemoveChatOpen, setIsRemoveChatOpen] = useState<boolean>(false);
    const [isOnline, setIsOnline] = useState(false);
    const queryClient = useQueryClient();

    const { data, isPending, isError, error } = useQuery({
        queryKey: ['CHAT_ID', id],
        queryFn: async () => await fetchData({
            method: 'GET',
            url: `/api/chat/${id}`,
            params: { populate: 'true' }
        }),
        staleTime: 1000 * 60 * 5,
        enabled: !!id,
        refetchOnWindowFocus: false,
        retry: false,
    });

    useEffect(() => {
        if (isPending) return;
        if (isError && error.message === 'Invalid chatId') {
            navigate('/chat', { replace: true });
        }
    }, [isError, error, isPending, navigate]);


    // infinity scroll 
    const {
        data: msgResp,
        isError: msgIsError,
        error: msgError,
        isFetching: msgPending,
        isFetchingNextPage,
        fetchNextPage,
        hasNextPage,
    } = useInfiniteQuery({
        queryKey: ['MESSAGE', id],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await fetchData({
                method: 'GET',
                url: `/api/chat/message/${id}`,
                params: { page: pageParam, limit: 10 },
            });
            return response.data.messages;
        },
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) =>
            lastPage?.length === 10 ? allPages.length + 1 : undefined,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        let timeout: NodeJS.Timeout | null = null;

        const handleScroll = () => {
            if (container.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(() => {
                    fetchNextPage(); // 👈 trigger here after delay
                }, 300); // 300ms delay
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => {
            container.removeEventListener("scroll", handleScroll);
            if (timeout) clearTimeout(timeout);
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);


    // clear all fetched page when id changed 
    useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: ['MESSAGE', id] });
        }
    }, [id, queryClient]);


    useEffect(() => {
        if (msgResp?.pages) {
            // manually update the chat list unread count 
            const chat = queryClient.getQueryData<{ data: Chat[] }>(['MY_CHATS']);

            const updatedChat = chat?.data?.map((chat) => {
                if (chat.chatId === id) {
                    return {
                        ...chat,
                        unread: 0,
                    };
                }
                return chat;
            });

            queryClient.setQueryData(['MY_CHATS'], { data: updatedChat });
        }
    }, [msgResp]);


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


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim() && !selectedFile) return
        let toastId = '1';

        try {

            let attachmentData = null;
            let response = null;
            let fileType = '';
            let fileUrl = '';


            if (selectedFile) {
                toast.loading('Please wait...', { id: toastId });
                setIsLoading(true);

                // Only JPEG, PNG, GIF, WEBP, and JPG images are allowed
                const imageType = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"];

                // Only MP3, MP4, WAV, and OGG audio files are allowed
                const audioType = ["audio/mpeg", "audio/wav", "audio/ogg"];

                // Only MP4, MOV, AVI, WMV, FLV, and MKV video files are allowed
                const videoType = ["video/mp4", "video/mov", "video/avi", "video/wmv", "video/flv", "video/mkv"];


                if (imageType.includes(selectedFile.type)) {
                    fileType = 'image';
                    response = await imageUpload(selectedFile);
                    fileUrl = response?.data?.image_url;
                } else if (audioType.includes(selectedFile.type)) {
                    fileType = 'audio';
                    response = await audioUpload(selectedFile);
                    fileUrl = response?.data?.audio_url;
                } else if (videoType.includes(selectedFile.type)) {
                    fileType = 'video';
                    response = await videoUpload(selectedFile);
                    fileUrl = response?.data?.video_url;
                } else {
                    throw new Error('Only images, videos, and audio are allowed');
                }

                if (!response?.success) {
                    throw new Error(response?.message || 'Failed to upload image');
                }

                attachmentData = {
                    url: fileUrl,
                    public_id: response?.data?.public_id,
                    type: fileType
                };

                setIsLoading(false);
                toast.dismiss(toastId);
            }

            // Prepare message data for socket
            const chatData = {
                chatId: data?.data?._id,
                members: data?.data?.members.map((member: { _id: string }) => member._id),
                message: message.trim(),
                attachment: attachmentData
            };

            // Send via socket
            if (socket) {
                socket.emit('NEW_MESSAGE', chatData);
                setMessage('');
                setSelectedFile(null);
            }
            // toast.success('Message sent successfully', { id: toastId });
        } catch (error: any) {
            toast.error(error.message || 'Failed to send message', { id: toastId });
        }
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
            // case 'document':
            //     fileInput.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx'
            //     break
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

    // message send and receive scroll to bottom last message 
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    useEffect(() => {
        if (!msgResp) return;
        if (msgResp.pages.length === 1) {
            scrollToBottom();
        }
    }, [msgResp]);


    // new message update
    const newMessagesHandler = useCallback((data: newMessages) => {
        // add new message in queryClient data
        const allMessages = queryClient.getQueryData(['MESSAGE', id]) as any;

        const newMessage = {
            _id: data.message.id,
            sender: {
                _id: data.message.sender._id,
                name: data.message.sender.name,
            },
            chat: data.chatId,
            content: data.message.content,
            attachments: data.message.attachments,
            createdAt: data.message.createdAt,
            updatedAt: data.message.createdAt,
        };


        const allData = {
            ...allMessages,
            pages: [
                [...allMessages.pages[0], newMessage],
                ...allMessages.pages.slice(1)
            ],
            pageParams: allMessages.pageParams
        };

        queryClient.setQueryData(['MESSAGE', id], allData);
        setTimeout(() => {
            scrollToBottom();
        }, 100);
    }, []);

    const eventHandlers = { NEW_MESSAGE_RECEIVED: newMessagesHandler };
    useSocketEvents(socket, eventHandlers);

    const otherUser = useMemo(() => {
        return data?.data?.members.find((member: { _id: string }) => member._id !== user?._id);
    }, [data?.data?.members, user?._id]);

    useEffect(() => {
        // If group chat, do nothing
        if (data?.data?.isGroup) return;

        const friendId = otherUser?._id;

        if (!socket || !friendId) return;

        // Initial check
        socket.emit('CHECK_ONLINE_STATUS', friendId, (res: { online: boolean }) => {
            setIsOnline(res.online);
        });

        // Listen to live changes
        socket.on('USER_ONLINE', (userId: string) => {
            if (userId === friendId) setIsOnline(true);
        });

        socket.on('USER_OFFLINE', (userId: string) => {
            if (userId === friendId) setIsOnline(false);
        });

        return () => {
            socket.off('USER_ONLINE');
            socket.off('USER_OFFLINE');
        };
    }, [socket, otherUser]);


    return (
        <div className='w-full h-screen flex'>
            {/* ChatList - Hide on mobile when showing messages */}
            <div className='w-[380px] max-[768px]:w-full max-[768px]:hidden'>
                <ChatList />
            </div>

            {/* Messages Section */}
            {
                isPending ? (
                    <div className='flex-1 flex items-center justify-center'>
                        <Loader />
                    </div>
                ) : isError ? (
                    <div className='flex-1 flex items-center justify-center'>
                        <p className='text-red-500'>{error.message || "Failed to load chat"}</p>
                    </div>
                ) : (
                    <div className='flex-1 flex flex-col h-screen bg-[var(--bg-secondary)] max-[768px]:w-full'>
                        {/* Header */}
                        <div className='bg-[var(--bg-primary)] py-2 px-4 flex items-center justify-between border-b border-[var(--border-primary)]'>
                            <div className='flex items-center gap-3'>
                                {/* Back button for mobile */}
                                <button onClick={() => navigate('/chat', { replace: true })} className='p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors hidden max-[768px]:block'>
                                    <IoArrowBack className='text-[var(--text-secondary)]' />
                                </button>

                                <div className='relative'>
                                    <div className='w-10 h-10 rounded-full overflow-hidden'>
                                        {otherUser?.profile && otherUser?.profile?.image_url ? (
                                            <img
                                                src={otherUser.profile.image_url}
                                                alt="Profile"
                                                className='w-full h-full object-cover'
                                            />
                                        ) : (
                                            <div className='w-full h-full bg-[var(--bg-secondary)] flex items-center justify-center'>
                                                <span className='text-[var(--text-secondary)] font-semibold text-xl'>{data?.data?.name?.charAt(0)}</span>
                                            </div>
                                        )}
                                    </div>
                                    {
                                        !data?.data?.isGroup && isOnline && (
                                            <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[var(--bg-primary)]'></div>
                                        )
                                    }
                                </div>
                                <div>
                                    <div className='flex items-center gap-2'>
                                        <h3 className='font-semibold text-[var(--text-primary)]'>{otherUser?.name}</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <button
                                    ref={chatMenuButtonRef}
                                    onClick={() => setShowChatMenu(!showChatMenu)}
                                    className='p-2 hover:bg-[var(--bg-secondary)] rounded-full transition-colors cursor-pointer'>
                                    <BsThreeDotsVertical className='text-[var(--text-secondary)]' />
                                </button>

                                {/* Chat Menu */}
                                {showChatMenu && (
                                    <UserMenu
                                        data={data?.data}
                                        user={user}
                                        chatMenuButtonRef={chatMenuButtonRef as React.RefObject<HTMLButtonElement>}
                                        setShowChatMenu={setShowChatMenu}
                                        setIsGroupEditOpen={setIsGroupEditOpen}
                                        setIsDeleteOpen={setIsDeleteOpen}
                                        setIsLeaveOpen={setIsLeaveOpen}
                                        setIsRemoveChatOpen={setIsRemoveChatOpen}
                                    />
                                )}
                            </div>
                        </div>


                        {isGroupEditOpen && <GroupEdit
                            groupData={data?.data}
                            setIsGroupEditOpen={setIsGroupEditOpen} />}
                        {/* Messages Container */}
                        <div className='flex-1 overflow-y-auto p-4 space-y-4 relative' ref={messagesContainerRef} style={{ height: '500px', overflowY: 'auto' }}>
                            {msgResp?.pages &&
                                [...msgResp.pages]
                                    .reverse()
                                    .map((page, pageIndex) =>
                                        page.map((msg: allMessage, msgIndex: number) => (
                                            <>
                                                {msgIndex === 0 && (
                                                    <p className='text-center text-[var(--text-secondary)] text-sm mt-5'>
                                                        {new Date(msg.createdAt).toLocaleDateString('en-US', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                )}

                                                <RenderMessage
                                                    key={`message-${msg._id}-${pageIndex}-${msgIndex}`}
                                                    user={user}
                                                    id={id}
                                                    msg={msg}
                                                />
                                            </>
                                        ))
                                    )}

                            {msgResp?.pages && (
                                msgResp.pages[0].length === 0 && (
                                    <div className='flex-1 h-full max-[700px]:hidden flex items-center flex-col justify-center text-[var(--text-secondary)]'>
                                        <p className='text-md mt-5'>No messages found. Start a conversation.</p>
                                    </div>
                                )
                            )}


                            {msgPending || isFetchingNextPage && (
                                <div className='w-full mt-10 text-center'>
                                    <span className="loading loading-dots loading-xl absolute top-5"></span>
                                </div>
                            )}

                            {/* {msgPending && (
                                <div className='w-full mt-10 text-center'>
                                    <span className="loading loading-dots loading-xl"></span>
                                </div>
                            )} */}

                            {msgIsError && (
                                <div className='w-full mt-10 text-center'>
                                    <p className='text-md mt-5 text-red-500'>{msgError.message}</p>
                                </div>
                            )}
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
                                        className="text-red-500 cursor-pointer text-sm hover:text-red-600"
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
                                            className='absolute bottom-12 left-0 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg shadow-lg py-2 min-w-[160px]'>
                                            <button
                                                onClick={() => handleFileSelect('image')}
                                                className='w-full text-left px-4 py-2 hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] flex items-center gap-3 transition-colors cursor-pointer'>
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
                                            <button disabled
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
                                    disabled={!!((!message.trim() && !selectedFile) || isLoading)}
                                    className='p-2 bg-[var(--btn-primary)] hover:bg-[var(--btn-secondary)] disabled:opacity-50 disabled:cursor-not-allowed rounded-full text-white transition-colors cursor-pointer'>
                                    <FaPaperPlane />
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

            {/* Delete Group */}
            <ConfirmDeleteGroup
                isOpen={isDeleteOpen}
                setIsLogoutOpen={setIsDeleteOpen}
            />

            {/* Leave Group */}
            <ConfirmLeaveGroup
                isOpen={isLeaveOpen}
                setIsLeaveOpen={setIsLeaveOpen}
            />

            {/* Remove Chat */}
            <ConfirmRemoveChat
                isOpen={isRemoveChatOpen}
                setIsRemoveChatOpen={setIsRemoveChatOpen}
            />

        </div>
    )

}


export default Messages;
