import { Link } from "react-router-dom"

export function BlogCard({ Author, title, content, Date,id }: any) {
    return <Link to={`/blog/${id}`}>
    <div className="border-b p-2 max-w-2xl cursor-pointer">
        <div className="flex">
            <Avatar name={Author} />
            <div className="flex flex-col justify-center pl-2">{Author}</div>
            <div className="flex flex-col justify-center pl-2">{Date.slice(0,10)}</div>
        </div>
        <div className="text-3xl font-bold">{title}</div>
        <div className="text-lg">{content.slice(0,150)}...</div>
        <div className="text-sm font-thin">{Math.ceil(content.length/100)} mintue(s) read</div>
    </div>
    </Link>
}

export function Avatar({name}:{name:string}) {
    return <div className="relative inline-flex items-center justify-center w-9 h-9 overflow-hidden bg-gray-600 rounded-full">
        <span className="font-medium text-gray-600 dark:text-gray-300">{name[0]}</span>
    </div>

}