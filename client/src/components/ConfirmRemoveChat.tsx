import React, { useState } from 'react';
import Button from './Button';
import { useAxios } from '../hook/useAxios';
import { handleResponse } from '../services/error';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

interface ConfirmDeleteGroupProps {
    isOpen: boolean;
    setIsRemoveChatOpen: (isOpen: boolean) => void;
}

const ConfirmRemoveChat: React.FC<ConfirmDeleteGroupProps> = ({ isOpen, setIsRemoveChatOpen }) => {

    const { fetchData } = useAxios();
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const ConfirmRemoveChatHandler = async () => {
        try {
            setLoading(true);

            const response = await fetchData({
                method: 'DELETE',
                url: `/api/chat/delete-chat/${id}`,
            });

            const { success, message } = handleResponse(response);

            if (success && message == "Chat person deleted successfully") {
                toast.success(message);
                setIsRemoveChatOpen(false);
                queryClient.invalidateQueries({ queryKey: ['MY_CHATS'] });
                navigate('/chat', { replace: true });
            } else {
                toast.error(message);
            }

        } catch (error: any) {
            const { message } = handleResponse(error);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle" open={isOpen}>
            <div className="modal-box bg-white rounded-md">
                <h3 className="font-bold text-lg">Confirm Remove Chat</h3>
                <p className="py-4">Are you sure you want to remove this chat?</p>
                <div className="modal-action">
                    <button className="btn border-none w-24 bg-base-300 h-11" onClick={() => setIsRemoveChatOpen(false)}>Close</button>
                    <Button
                        type="submit"
                        className='!bg-red-600 !w-30 !p-0  h-11'
                        isLoading={loading}
                        onClick={ConfirmRemoveChatHandler}
                    >
                        Remove
                    </Button>
                </div>
            </div>
        </dialog>
    )
}

export default ConfirmRemoveChat

