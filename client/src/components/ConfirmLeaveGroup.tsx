import React, { useState } from 'react';
import Button from './Button';
import { useAxios } from '../hook/useAxios';
import { handleResponse } from '../services/error';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

interface ConfirmLeaveGroupProps {
    isOpen: boolean;
    setIsLeaveOpen: (isOpen: boolean) => void;
}

const ConfirmLeaveGroup: React.FC<ConfirmLeaveGroupProps> = ({ setIsLeaveOpen, isOpen }) => {

    const { fetchData } = useAxios();
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();


    const handleLeaveGroup = async () => {
        try {
            setLoading(true);

            const response = await fetchData({
                method: 'DELETE',
                url: '/api/group/leave-group',
                data: { chatId: id }
            });

            const { success, message } = handleResponse(response);

            if (success && message == "Left the group successfully") {
                toast.success(message);
                setIsLeaveOpen(false);
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

    };

    return (
        <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle" open={isOpen}>
            <div className="modal-box bg-white rounded-md">
                <h3 className="font-bold text-lg">Confirm Leave Group</h3>
                <p className="py-4">Are you sure you want to leave this group?</p>
                <div className="modal-action">
                    <button className="btn border-none w-24 bg-base-300 h-11" onClick={() => setIsLeaveOpen(false)}>Close</button>
                    <Button
                        type="submit"
                        className='!bg-red-600 !w-30 !p-0  h-11'
                        isLoading={loading}
                        onClick={handleLeaveGroup}
                    >
                        Leave
                    </Button>
                </div>
            </div>
        </dialog>
    )
}

export default ConfirmLeaveGroup
