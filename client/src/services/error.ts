
interface ErrorResponse {
    success: boolean
    message: string
    statusCode?: number | string,
    data?: any
}

export const handleResponse = (response: ErrorResponse) => {
    const success = response?.success || response?.data?.success || false;
    const message = response?.message || response?.data?.message || 'Something went wrong';
    const statusCode = response?.statusCode || response?.data?.statusCode || 500;
    const data = response?.data || response?.data?.data || null;
    return { success, message, statusCode, data };
}