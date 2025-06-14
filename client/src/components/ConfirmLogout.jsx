import React, { useState } from 'react';
import Button from './Button';
import { useAxios } from '../hook/useAxios';
import { handleResponse } from '../services/error';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const ConfirmLogout = ({ isOpen, setIsLogoutOpen }) => {

    const [loading, setLoading] = useState(false);
    const { fetchData } = useAxios();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            setLoading(true);

            const response = await fetchData({
                method: 'GET',
                url: '/api/auth/logout'
            });

            const { success, message } = handleResponse(response);

            if (success && message == "Logout successful") {
                toast.success(message);
                setIsLogoutOpen(false);
                queryClient.removeQueries();
                navigate('/login', { replace: true });
            } else {
                toast.error(message);
            }

        } catch (error) {
            const { message } = handleResponse(error);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle" open={isOpen}>
                <div className="modal-box bg-white rounded-md">
                    <h3 className="font-bold text-lg">Hello!</h3>
                    <p className="py-4">Press ESC key or click the button below to close</p>
                    <div className="modal-action">
                        <button className="btn border-none bg-base-300" onClick={() => setIsLogoutOpen(false)}>Close</button>
                        <Button
                            type="submit"
                            className='!bg-red-600 !w-22'
                            isLoading={loading}
                            onClick={logoutHandler}
                        >
                            Login
                        </Button>
                    </div>
                </div>
            </dialog>
        </>
    )
}

export default ConfirmLogout;
