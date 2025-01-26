import axios from "axios";
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../config";

interface Blog {
    "id": string,
    "title": string,
    "content": string,
    "time": string,
    "author":{
        "name":string,
    }
}

export function useBlogs() {
    const [loading, setLoading] = useState(true)
    const [blogs, setBlogs] = useState<Blog[]>([]);

    useEffect(()=>{
        axios.get(`${BACKEND_URL}/api/v1/blog/bulk`,{
            headers:{
                Authorization: localStorage.getItem("token")
            }
        }).then(responce => {
            setBlogs(responce.data.blogs)
            setLoading(false)
        })
    },[])
    return {blogs,loading}
}

export function useBlog ({id}:{id:string}){
    const [loading, setLoading] = useState(true)
    const [blog, setBlog] = useState<Blog>();

    useEffect(()=>{
        axios.get(`${BACKEND_URL}/api/v1/blog/${id}`,{
            headers:{
                Authorization: localStorage.getItem("token")
            }
        }).then(responce => {
            setBlog(responce.data.blog)
            setLoading(false)
        })
    },[id])
    return {blog,loading}
}