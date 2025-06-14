export interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    isActive?: boolean;
    profile: {
        image_url?: string;
        public_id?: string;
    } | null;
}
