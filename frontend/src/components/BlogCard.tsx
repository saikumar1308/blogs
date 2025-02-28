import { Link } from "react-router-dom"

export function BlogCard({ Author, title, content, Date,id }: any) {
    return <Link to={`/blog/${id}`}>
    <div className="border-b p-2 max-w-2xl cursor-pointer">
        <div className="flex">
            <Avatar name={Author} />
            <div className=" text-2xl pl-2 pb-2">{Author}</div>
            <div className="pb-2 text-2xl text-grey-500">&nbsp;|</div>
            <div className=" text-xl pl-2 pt-1">{Date.slice(0,10)}</div>
        </div>
        <div className="text-3xl font-semibold my-2">{title}</div>
        <div className="text-lg">{content.slice(0,200)}...</div>
        <div className="text-sm font-thin my-2">{Math.ceil(content.length/200)} mintue(s) read</div>
    </div>
    </Link>
}

export function Avatar({name}:{name:string}) {
    return <div className="relative inline-flex items-center justify-center w-9 h-9 overflow-hidden bg-green-600 rounded-full">
        <span className="font-medium text-white pb-1">{name[0].toUpperCase()}</span>
    </div>

}