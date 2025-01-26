import { Avatar } from "./BlogCard";

export function FullBlogCard({ Author, title, content, Date, id }: any) {
    return <div className="grid grid-cols-3 max-w-7xl pt-10 gap-7">
        <div className="col-span-2 ">
            <div className="text-3xl font-bold">{title}</div>
            <div>Posted on {Date.slice(0,10)}</div>
            <div className="font-semibold text-lg pt-2">{content}</div>
        </div>
        <div className="">
            <div className="font-semibold">Author details</div>
            <div className="flex pt-5">
            <Avatar name="Sai" />
            <div className="flex flex-col pl-2 text-2xl font-bold">{Author}</div>
            </div>
        </div>
    </div>
}