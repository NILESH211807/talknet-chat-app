import Image from './message-types/Image';
import Video from './message-types/Video';
import Audio from './message-types/Audio';
import Document from './message-types/Document';
import { User } from '../types/User';
import { allMessage } from '../types/message';

const RenderMessage = ({ msg, user }: { msg: allMessage, user: User | null, id: string | undefined }) => {
    const isMe = user?._id === msg.sender._id;

    return (
        <div
            key={msg.id}
            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[70%] max-[480px]:max-w-[85%] border border-[var(--border-primary)] p-3 rounded-sm ${isMe
                    ? 'bg-[var(--btn-primary)] text-white rounded-br-none'
                    : 'bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-bl-none'
                    }`}>

                {
                    msg?.attachments?.map((attachment: any) => {
                        switch (attachment?.type) {
                            case 'image':
                                return <Image data={attachment} key={attachment.public_id} msg={attachment} />
                            case 'video':
                                return <Video data={attachment} key={attachment.public_id} msg={attachment} />
                            case 'audio':
                                return <Audio data={attachment} key={attachment.public_id} msg={attachment} />
                            case 'document':
                                return <Document key={attachment.public_id} msg={attachment} />
                            default:
                                return null;
                        }
                    })
                }
                {msg.content && <p className={`${msg?.attachments[0]?.type == 'image' && 'w-[280px]'}`}>{msg.content}</p>}
                <span className={`text-xs ${isMe ? 'text-[#ffffff90]' : 'text-[var(--text-secondary)]'} block mt-1`}>
                    {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    })}
                </span>
            </div>
        </div>
    )
}

export default RenderMessage
