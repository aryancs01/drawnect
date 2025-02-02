"use client"
import { Button } from "@repo/ui/button";
import axios from "axios";
import Link from "next/link";
import { HTTP_BACKEND } from "../config";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Dashboard from "../app/dashboard/[...user]/page";
import { useRouter } from "next/navigation";

export default function AuthSign({isSignup}:{
    isSignup:boolean
}){
    const router = useRouter();
    const [mounted,setMounted] = useState(false);
    const [loading,setLoading] = useState(false);
    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    useEffect(()=>{
        setMounted(true)
    },[])
    
    async function signTheUser() {
        setLoading(true)
        if(isSignup){
            try {
                const response =await axios.post(`${HTTP_BACKEND}/signup`,{
                    name:nameRef.current?.value,
                    username:emailRef.current?.value,
                    password:passwordRef.current?.value
                })
                toast.success("Signin Success")
                if(response.data.token){
                    const email = response.data.emailId
                    localStorage.setItem("token",response.data.token);
                    localStorage.setItem("name",response.data.name);
                    localStorage.setItem("email",email);
                }
                setLoading(false)
                if(!mounted) return;
                else router.push(`/dashboard/${response.data.name}/${response.data.emailId}`)
            } catch (error) {
                //@ts-ignore
                toast.error((error as Error).response?.data.message)
                setLoading(false)
            }
        }else{
            try {
                const response = await axios.post(`${HTTP_BACKEND}/signin`,{
                username:emailRef.current?.value,
                password:passwordRef.current?.value
            })
            
                toast.success("Signin Success")
                if(response.data.token){
                    localStorage.setItem("token",response.data.token);
                    localStorage.setItem("name",response.data.name);
                    localStorage.setItem("email",response.data.emailId);                }
                setLoading(false)
                if(!mounted) return;
                else router.push(`/dashboard/${response.data.name}/${response.data.emailId}`)
            } catch (error) {
                //@ts-ignore
                toast.error((error as Error).response?.data.message)
                setLoading(false)
            }
        }
       
    }

    return <div className="">
    <div className="w-full h-screen flex flex-col gap-12 justify-center items-center bg-gradient-to-b from-indigo-100 to-white" >
        <div className="bg-white p-10 shadow-xl rounded-md  flex flex-col">
            <div className="flex flex-col pt-6">
                <h4 className="text-blue-900 font-bold text-3xl text-center">{(isSignup)?"Signup":"Signin"} to your account</h4>
            </div>
            <div className="text-center pt-2">
                <p className="text-blue-400">{(isSignup)? "Start creating and collaborating today" : "Welcome back to DrawTogether"}</p>
            </div>
            {(isSignup)?<div className="pt-10 flex flex-col">
                <label className="text-lg text-black">Name</label>
                <input ref={nameRef} className="text-black p-2 rounded-md border-1 border-slate-300" type="text" required/>
            </div>:""}
            <div className="pt-10 flex flex-col">
                <label className="text-lg text-black">Email Address</label>
                <input ref={emailRef} className="text-black p-2 rounded-md border-1 border-slate-300" type="email" required/>
            </div>
            <div className="pt-7 flex flex-col">
                <label className="text-lg text-black">Password</label>
                <input ref={passwordRef} className="text-black p-2 rounded-md border-1 border-slate-300" type="password" required/>
            </div>
            <div className="w-full flex justify-center p-6">
                {(loading)?
                    <Button
                    text={"...."}
                    variant="loading"
                    size="xl"
                    onclick={signTheUser}/>
                :
                    <Button
                    text={(isSignup)?"Signup":"Signin"}
                    variant="primary"
                    size="xl"
                    onclick={signTheUser}
                />}
                
            </div>
            <div className="text-blue-400 text-center">
            {(isSignup)?"Already have an account?":"Don't have an account?"}  <Link href={(isSignup)?"/signin":"/signup"} className="text-blue-800">{(isSignup)?"Signin":"Signup"}</Link> 
            </div>
        </div>
        <Link href={"/home"}>
            <div className="text-blue-700 cursor-pointer">
                {"<-- Back Home"}
            </div>
        </Link>
       
    </div>
    
</div>
}