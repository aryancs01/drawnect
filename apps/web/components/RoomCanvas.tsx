"use client"

import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}:{roomId:string}){
    const [socket,setSocket] = useState<WebSocket | null>(null);

    useEffect(()=>{
        const ws = new WebSocket(`ws://localhost:8080?token=${localStorage.getItem("token")}`)

        ws.onopen = ()=>{
            console.log("WebSocket Connected")
            setSocket(ws)
            ws.send(JSON.stringify({
                type:"join_room",
                roomId
            }))
        }
    
    },[])

    

    if(!socket){
        return <div>
            connecting to server..
        </div>
    }
    return <div>
        <Canvas roomId={roomId} socket={socket}/>
    </div>
}