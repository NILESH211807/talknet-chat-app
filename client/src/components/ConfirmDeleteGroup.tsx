import React, { useState } from 'react';
import Button from './Button';
import { useAxios } from '../hook/useAxios';
import { handleResponse } from '../services/error';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

interface ConfirmDeleteGroupProps {
    isOpen: boolean;
    setIsLogoutOpen: (isOpen: boolean) => void;
}

const ConfirmDeleteGroup: React.FC<ConfirmDeleteGroupProps> = ({ isOpen, setIsLogoutOpen }) => {

    const { fetchData } = useAxios();
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const deleteGroupHandler = async () => {

        try {
            setLoading(true);

            const response = await fetchData({
                method: 'DELETE',
                url: '/api/group/delete-group',
                data: { chatId: id }
            });

            const { success, message } = handleResponse(response);

            if (success && message == "Group deleted successfully") {
                toast.success(message);
                setIsLogoutOpen(false);
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
                <h3 className="font-bold text-lg">Confirm Delete Group</h3>
                <p className="py-4">Are you sure you want to delete this group?</p>
                <div className="modal-action">
                    <button className="btn border-none w-24 bg-base-300 h-11" onClick={() => setIsLogoutOpen(false)}>Close</button>
                    <Button
                        type="submit"
                        className='!bg-red-600 !w-30 !p-0  h-11'
                        isLoading={loading}
                        onClick={deleteGroupHandler}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </dialog>
    )
}

export default ConfirmDeleteGroup
