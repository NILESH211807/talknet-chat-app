import { FaMicrophone } from 'react-icons/fa'

const Audio = ({ data }: any) => {
    return (
        <div className="mb-2 min-w-[280px] max-w-[300px]">
            <div className="bg-[var(--bg-secondary)] p-2 rounded-sm">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <FaMicrophone className="text-[var(--text-secondary)]" />
                        <span className="text-sm font-semibold text-[var(--text-secondary)]">Audio Message</span>
                    </div>
                    <a
                        href={data?.url}
                        target="_blank"
                        download
                        className="text-[var(--btn-primary)] hover:text-[var(--btn-secondary)] text-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Download
                    </a>
                </div>
                <audio
                    src={data?.url}
                    controls
                    className="w-full h-8"
                    preload="metadata"
                />
            </div>
        </div>
    )
}

export default Audio
