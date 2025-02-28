import { useState } from "react"
import { AppBar } from "./AppBar"
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export function BlogPost() {
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")

    const navigate = useNavigate();

    return <div className="">
        <AppBar />
        <div className="h-screen">
            <div className="max-w-2xl mx-auto my-5 border rounded-lg">
                <div className="p-5">
                    <div className="text-5xl mb-6 ml-20 pl-20 font-thin text-green-700">Upload your blog</div>
                    <div className="mb-6">
                        <input onChange={(e) => {
                            setTitle(e.target.value)
                        }} type="text" id="large-input" className="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:outline-none " placeholder="Title of the Blog" />
                    </div>
                    <div>
                        <textarea onChange={(e) => {
                            setContent(e.target.value)
                        }} id="message" rows={10} className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none " placeholder="Write your blog here..."></textarea>
                    </div>
                    <div className="flex justify-center pt-5">
                        <button onClick={async () => {
                            const response = await axios.post(`${BACKEND_URL}/api/v1/blog`, {
                                title,
                                content,
                            }, {
                                headers: {
                                    Authorization: localStorage.getItem('token')
                                }
                            })
                            navigate(`/blog/${response.data.id}`)
                        }} className="text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2  ">Publish</button>
                    </div>
                </div>
            </div>
        </div>

        <footer className="bg-white mb-4 border-t ">
            <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
                <span className="text-sm text-gray-500 sm:text-center ">© 2024 <a href="/blogs" className="hover:underline">Blogs™</a>. All Rights Reserved.
                </span>
                <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500  sm:mt-0">
                    <li>
                        <a href="#" className="hover:underline me-4 md:me-6">Developed by Sai Kumar</a>
                    </li>
                </ul>
            </div>
        </footer>
    </div>
}