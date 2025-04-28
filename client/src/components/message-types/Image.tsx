import React from 'react'

const Image = ({ msg }: any) => {
    return (
        <div className="mb-2">
            <img
                src={msg.image}
                alt="Message attachment"
                className="w-[280px] object-cover h-[250px] rounded-sm cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(msg.image, '_blank')}
            />
        </div>
    )
}

export default Image
