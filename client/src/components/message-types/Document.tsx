import React from 'react'
import { FaPaperclip, FaFilePdf, FaFileWord, FaFileAlt, FaFileExcel, FaFilePowerpoint } from 'react-icons/fa'

const getFileIcon = (fileName: string | undefined) => {
    if (!fileName) return FaFileAlt;
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf':
            return FaFilePdf;
        case 'doc':
        case 'docx':
            return FaFileWord;
        case 'xls':
        case 'xlsx':
            return FaFileExcel;
        case 'ppt':
        case 'pptx':
            return FaFilePowerpoint;
        case 'txt':
            return FaFileAlt;
        default:
            return FaFileAlt;
    }
};

const getFileTypeLabel = (fileName: string | undefined) => {
    if (!fileName) return 'Document';
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf':
            return 'PDF Document';
        case 'doc':
        case 'docx':
            return 'Word Document';
        case 'xls':
        case 'xlsx':
            return 'Excel Spreadsheet';
        case 'ppt':
        case 'pptx':
            return 'PowerPoint Presentation';
        case 'txt':
            return 'Text Document';
        default:
            return 'Document';
    }
};

const Document = ({ msg }: any) => {
    return (
        <div className="mb-2 min-w-[280px] max-w-[300px]">
            <div className="bg-[var(--bg-secondary)] p-3 rounded-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-[var(--bg-primary)] border border-[var(--border-primary)] p-3 rounded-sm">
                        {React.createElement(getFileIcon(msg.text), {
                            className: "text-[var(--btn-primary)] text-2xl"
                        })}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-[var(--text-primary)]">
                            {msg.text || "Untitled Document"}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                            <span>{getFileTypeLabel(msg.text)}</span>
                            {msg.text && (
                                <span className="bg-[var(--bg-primary)] px-2 py-0.5 rounded-full text-[10px] border border-[var(--border-primary)]">
                                    {msg.text.split('.').pop()?.toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => window.open(msg.text, '_blank')}
                            className="text-[var(--btn-primary)] hover:text-[var(--btn-secondary)] p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors">
                            <FaFileAlt className="text-lg" />
                        </button>
                        <a
                            href={msg.text}
                            download
                            className="text-[var(--btn-primary)] hover:text-[var(--btn-secondary)] p-2 hover:bg-[var(--bg-primary)] rounded-full transition-colors"
                            onClick={(e) => e.stopPropagation()}>
                            <FaPaperclip className="transform rotate-45 text-lg" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Document
