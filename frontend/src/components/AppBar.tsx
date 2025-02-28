import { Link } from "react-router-dom";
import { Avatar } from "./BlogCard";

export function AppBar() {
    return <div className="flex justify-between pl-7 pr-7 p-3  border-b">
        <div className="text-4xl font-bold text-green-600 "><Link to={'/blogs'}>Blogs</Link></div>
        <div className=" flex">
            <div className="pr-7 flex">
                <Link to={'/blog'}>
                    <button className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2  ">Upload</button>
                </Link>
            </div>
            <div className="text-2xl">
                <a href="/signin">
                    <Avatar name={"Abhi"} />
                </a>
            </div>
        </div>
    </div>
}