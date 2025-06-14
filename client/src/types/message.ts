export interface allMessage {
    id?: number;
    _id?: string;
    content?: string;
    // image?: string;
    // video?: string;
    // audio?: string;
    // document?: string;
    sender: {
        _id: string;
        name: string;
    };
    createdAt: string;
    attachments: {
        url: string;
        public_id: string;
        type: string;
    }[];
    // type: 'text' | 'image' | 'video' | 'audio' | 'document';
}


export interface newMessages {
    chatId: string;
    message: allMessage;
}
