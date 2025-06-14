import { useAxios } from '../hook/useAxios';

// upload file to cloudinary
export const attachmentUpload = () => {
    const { fetchData } = useAxios();
    const imageUpload = async (file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('image', file);
        return await fetchData({
            method: 'POST',
            url: '/api/upload/attachment/image',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    const audioUpload = async (file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('audio', file);
        return await fetchData({
            method: 'POST',
            url: '/api/upload/attachment/audio',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    const videoUpload = async (file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('video', file);
        return await fetchData({
            method: 'POST',
            url: '/api/upload/attachment/video',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    return { imageUpload, audioUpload, videoUpload };
}

