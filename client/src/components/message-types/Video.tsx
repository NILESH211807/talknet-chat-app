import { FaVideo } from 'react-icons/fa'

const Video = ({ data }: any) => {
    return (
        <div className="mb-2 w-[280px] rounded-sm overflow-hidden">
            <div className="bg-[var(--bg-secondary)] p-2 rounded-t-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FaVideo className="text-[var(--text-secondary)]" />
                        <span className="text-sm font-semibold text-[var(--text-secondary)]">Video</span>
                    </div>
                    <a
                        href={data?.url}
                        target="_blank"
                        download
                        className="text-[var(--btn-primary)] hover:text-[var(--btn-secondary)] text-sm"
                        onClick={(e) => e.stopPropagation()}>
                        Download
                    </a>
                </div>
            </div>
            <video
                src={data?.url}
                controls
                className="w-full aspect-video object-contain bg-black"
                preload="metadata" />
        </div>
    )
}

export default Video
