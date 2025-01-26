import { useParams } from "react-router-dom";
import { FullBlogCard } from "../components/FullBlogCard";
import { useBlog } from "../hooks";
import { AppBar } from "../components/AppBar";

export function Blog() {
    const { id } = useParams()
    const { blog, loading } = useBlog({ id: id || "" })

    if(loading){
        return <div>
            Loading............
        </div>
    }

    return <div className="">
        <AppBar />
        <div className="flex justify-center">
        <FullBlogCard 
        Author={blog?.author.name}
        title={blog?.title}
        content={blog?.content}
        Date={blog?.time}
        id={blog?.id}
        />
        </div>
    </div>
}