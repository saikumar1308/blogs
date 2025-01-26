import { SignupType } from "@saikumar1308/common-blogs";
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config";

export function SignupComp({ type }: { type: 'signup' | 'signin' }) {
    const [postInputs, setPostInputs] = useState<SignupType>({
        name: "",
        password: ""
    })

    const navigate = useNavigate()

    async function sendRequest(){
        try {
            const res = await axios.post(`${BACKEND_URL}/api/v1/user/${type==="signup"?"signup":"signin"}`,postInputs)
            const token = res.data
            localStorage.setItem("token",token)
            navigate("/blogs")
        } catch (error) {
            alert("error while signing up!!!!")
        }
    }

    return <div className="h-screen pt-20">
        <div className="flex justify-self-center flex-col  border w-96 p-6 rounded-lg text-2xl shadow-lg shadow-black bg-white">
            <div className="flex justify-center">
                <div className="">
                    <div className="justify-center flex font-serif text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500 pb-2">
                        <h1>{type === 'signup' ? "Signup" : "Signin"}</h1>
                    </div>
                    <div className=" p-3">
                        <input className="border-b p-1" type="text" placeholder="Name" onChange={(c) => {
                            setPostInputs({
                                ...postInputs,
                                name: c.target.value
                            })
                        }} />
                    </div>
                    <div className=" p-3">
                        <input className="border-b p-1" type="password" placeholder="Password" onChange={(c) => {
                            setPostInputs({
                                ...postInputs,
                                password: c.target.value
                            })
                        }} />
                    </div>
                    <div className="p-3">
                        <button type="submit" className="border border-blue-900 p-1 pl-3 pr-3 rounded bg-blue-600" onClick={sendRequest} >{type === "signup" ? "Signup" : "Signin"}</button>
                    </div>
                    <div className="flex">
                        <p className="text-sm">{type === "signup" ? "You already have an account?" : "Not a member?"}</p>
                        <Link to={type === "signup" ? "/signin" : "/signup"} className="text-sm underline pl-2">{type === "signup" ? "Signin" : "Signup"}</Link>
                    </div>
                </div>
            </div>
        </div>
    </div>
}