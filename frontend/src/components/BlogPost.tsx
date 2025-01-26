import { useState } from "react"
import { AppBar } from "./AppBar"
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function BlogPost() {
    const [title, setTitle] = useState("")
    const [content, setContent] =useState("")

    const navigate = useNavigate();

    return <div className="">
        <AppBar />
        <div className="max-w-2xl mx-auto my-5 border rounded-lg">
            <div className="p-5">
                <div className="mb-6">
                    <input onChange={(e)=>{
                        setTitle(e.target.value)
                    }} type="text" id="large-input" className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:outline-none " placeholder="Title of the Blog" />
                </div>
                <div>
                    <textarea onChange={(e)=>{
                        setContent(e.target.value)
                    }} id="message" rows={10} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none " placeholder="Write your blog here..."></textarea>
                </div>
                <div className="flex justify-center pt-5">
                    <button onClick={async ()=>{
                        const response = await axios.post(`${BACKEND_URL}/api/v1/blog`,{
                            title,
                            content,
                        },{
                            headers:{
                                Authorization: localStorage.getItem('token')
                            }
                        })
                        navigate(`/blog/${response.data.id}`)
                    }}  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2  ">Publish</button>
                </div>
            </div>
        </div>
    </div>
}