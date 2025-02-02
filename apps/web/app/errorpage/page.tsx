"use client"

import { useRouter } from "next/navigation"

export default function ErrorPage(){
    const router = useRouter()
    return <div className="w-full h-screen bg-gradient-to-b from-indigo-100 to-white flex justify-center items-center text-black">
        <div className="border-1 border-blue-400 p-7 flex flex-col gap-2">

            <h4 className="text-xl">ROOMID NOT FOUND </h4>
            <h4 className="text-xl">Status Code:400 </h4>
            <div onClick={()=>{
               router.push(`/dashboard/${localStorage.getItem("name")}/${localStorage.getItem("email")}`)
            }} className="text-lg mt-4 text-gray-500 cursor-pointer"> {"<-- Back to Dashboard"}</div>
        </div>
    </div>
}