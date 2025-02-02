"use client"

import { Button } from "@repo/ui/button";
import axios from "axios";
import { useEffect, useRef, useState } from "react"
import { HTTP_BACKEND } from "../config";
import toast from "react-hot-toast";
import { Clock, X } from "lucide-react";
import { getAllRooms } from "../app/(GetRoom)";
import { useRouter } from "next/navigation";
import { RoomSkimmer } from "./RoomSkimmer";

type btnTypes = "create" | "join"

type messageType = {
    slug: string;
    createdAt: string;
    id:string
}

export function ClientDashboard({name,email}:{
    name:string,
    email:string
}){
    const router = useRouter()
    const [roomIds,setRoomIds] = useState<messageType[]>([]);
    const getRoomId = useRef<HTMLInputElement>(null);
    const [isClick,setIsClick] = useState<btnTypes>("create");
    async function userRoomJoin(){
        if(isClick === "create"){
            try {
                const response =await axios.post(`${HTTP_BACKEND}/create-room`,{
                    name:getRoomId.current?.value
                },{
                    headers:{
                        "Authorization":localStorage.getItem("token")
                    }
                })
                toast.success("Signin Success")
            } catch (error) {
                //@ts-ignore
                toast.error((error as Error).response?.data.message)
            }

        }else{
            try {
                const response =await axios.get(`${HTTP_BACKEND}/room/${getRoomId?.current?.value}`,{
                    headers:{
                        "Authorization":localStorage.getItem("token")
                    }
                })
                toast.success("Redirecting to Room");
                router.push("/room/"+response.data.roomId.id)
            } catch (error) {
                //@ts-ignore
                toast.error((error as Error).response?.data.message)
            }
        }
    }

    async function asyncFn(){
        const messages = getAllRooms();
        setRoomIds(await messages)
    }

    useEffect(()=>{
       asyncFn()
    },[])

    function logout(){
        localStorage.removeItem("token")
        localStorage.removeItem("name")
        localStorage.removeItem("email")
        router.push("/home")
    }
    
    return (
        <div>
            <div className="w-full h-screen flex flex-col gap-6 items-center bg-gradient-to-b from-indigo-100 to-white">
                <div className="w-full p-7 text-right">
                    <Button
                            variant="primary"
                            size="xl"
                            text="Logout"
                            onclick={logout}
                    />
                </div>
                <div className="bg-blue-600 text-2xl mt-10 p-7 w-1/2 rounded-xl shadow-lg">
                    <div className="font-bold text-3xl">
                        {`Welcome, ${name}`}
                    </div>
                    <div className="text-sm">
                        {email}
                    </div>
                </div>
                <div className="w-1/2 flex justify-between gap-4 ">
                    <div className="p-7 w-1/2 bg-white rounded-md border-1 border-blue-300 shadow-xl">
                        <div>
                            <h4 className="text-blue-700 text-2xl font-bold">Create or Join Room </h4>
                            <p className="text-gray-400">Start a new session or join an existing one</p>
                        </div>
                        <div className="mt-3 flex bg-gray-200 p-2 rounded-sm">
                           <button onClick={()=>{
                            setIsClick("create")
                           }} className={`${(isClick === "create")?"bg-white text-black":"bg-gray-200 text-gray-500"}  px-4 py-1 w-full rounded-md`}>
                                Create Room
                           </button>
                           <button onClick={()=>{
                            setIsClick("join")
                           }} className={`${(isClick === "join")?"bg-white text-black":"bg-gray-200 text-gray-500"}  px-4 py-1 w-full rounded-md`}>
                                Join Room
                           </button>
                        </div>
                        <div>
                            <input ref={getRoomId} placeholder="Enter room name" className="mt-5 p-2 rounded-md text-black border-1 border-blue-400 w-full"/>
                        </div>
                        <div className="mt-4 w-full text-center">
                            <Button
                                    variant="primary"
                                    size="lg"
                                    text={`${(isClick === "create")?"Create room":"Join room"}`}
                                    onclick={userRoomJoin}
                            />
                        </div>
                    </div>
                    <div className="w-1/2 flex flex-col p-5 rounded-md bg-white text-blue-500 border-1 border-blue-300 shadow-xl overflow-y-scroll  no-scrollbar">
                        <div className="flex flex-col gap-2">
                            <h3 className="flex items-center font-bold text-2xl gap-3">{<Clock/>}Previous Rooms</h3>
                            <p className="text-gray-400">Access your recent drawing rooms</p>
                        </div>
                        <div className="w-full h-28 pt-2  rounded-2xl px-2 cursor-pointer">
                            {(roomIds.length === 0)?
                            <RoomSkimmer/>:
                            roomIds.map((room,index)=>{
                                return <div key={room.id} onClick={()=>{
                                    router.push("/room/"+room.id.toString())
                                }} className="flex flex-col w-full hover:bg-gray-100 px-3 py-2 rounded-lg">
                                <h5>{room.slug}</h5>
                                <div className="text-slate-400 flex w-full justify-between text-sm">
                                    <p>RoomId: {room.id}</p>
                                    <p>{room.createdAt.substring(0,10)}</p>
                                </div>
                               </div>
                            })}
                           
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}