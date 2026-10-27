import axios from "axios";
import { useEffect, useState } from "react"
import { BACKEND_URL } from "../config";

interface Blog {
    "id": string,
    "title": string,
    "content": string,
    "time": string,
    "authorId"?: string,
    "author": {
        "name": string,
    }
}

export function useBlogs() {
    const [loading, setLoading] = useState(true)
    const [blogs, setBlogs] = useState<Blog[]>([]);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/v1/blog/bulk`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        }).then(response => {
            setBlogs(response.data.blogs || [])
            setLoading(false)
        }).catch(() => {
            setLoading(false)
        })
    }, [])

    return { blogs, setBlogs, loading }
}

export function useBlog ({ id }: { id: string }) {
    const [loading, setLoading] = useState(true)
    const [blog, setBlog] = useState<Blog>();

    useEffect(() => {
        if (!id) return;
        axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
            headers: {
                Authorization: localStorage.getItem("token")
            }
        }).then(response => {
            setBlog(response.data.blog)
            setLoading(false)
        }).catch(() => {
            setLoading(false)
        })
    }, [id])

    return { blog, loading }
}