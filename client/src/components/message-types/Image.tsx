
const Image = ({ data }: any) => {

    return (
        <div className="mb-2">
            <img
                src={data?.url}
                alt="Message attachment"
                className="w-[280px] rounded-sm cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => window.open(data?.url, '_blank')}
            />
        </div>
    )
}

export default Image
