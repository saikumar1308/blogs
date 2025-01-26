import { Link } from "react-router-dom";
import { Avatar } from "./BlogCard";

export function AppBar() {
    return <div className="flex justify-between pl-7 pr-7 p-3  border-b">
        <div className="text-4xl font-bold "><Link to={'/blogs'}>Blogs</Link></div>
        <div className=" flex">
            <div className="pr-7 flex">
                <Link to={'/blog'}>
                <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2  ">Upload</button>
                </Link>
            </div>
            <div className="text-2xl">
                <Avatar name={"Abhi"} />
            </div>
        </div>
    </div>
}