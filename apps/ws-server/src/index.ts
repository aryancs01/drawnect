import { WebSocketServer,WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
const wss = new WebSocketServer({port:8080});
import {prismaClient} from "@repo/db/client";

interface User {
    ws:WebSocket;
    rooms: string[];
    userId: string
}

const users: User[] = []


function checkUser(token:string):string | null{
    try {
        const decoded = jwt.verify(token,JWT_SECRET) as JwtPayload;

        if(typeof decoded === "string"){
            return null;
        }

        if(!decoded || !decoded.responseId){
            return null;
        }  

        return decoded.responseId;
    } catch (error) {  
        return null;
    }
    
}

wss.on("connection",async function connection(ws,request){
    const url = request.url;
    if(!url){
        return;
    }
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') ?? "";

    const userId = checkUser(token);
    if(!userId){
        ws.close();
        return
    }
    users.push({
        userId,
        rooms:[],
        ws
    })

    ws.on('message',async function message(data){
        let parseData;
        if(typeof data !== "string"){
            parseData = JSON.parse(data.toString());
        }else{
            parseData = JSON.parse(data)
        }

        if(parseData.type === "join_room"){
            const user = users.find(x => x.ws === ws);
            const response = await prismaClient.room.findFirst({
                where:{
                    id:parseInt(parseData.roomId)
                }
            })
            if(response){
                user?.rooms.push(""+parseData.roomId)
            }else{
                user?.ws.send(JSON.stringify({
                    type:"error",
                    message:"roomId not found"
                }))
            }
        }

        if(parseData.type === "leave_room"){
            const user = users.find(x => x.ws === ws);
            if(!user){
                return;
            }
            user.rooms = user?.rooms.filter(x => x=== parseData.room);
        }

        if(parseData.type === "chat"){
            const roomId = parseData.roomId;
            const message = parseData.message;
            
            await prismaClient.chat.create({
                data:{
                    roomId,
                    message,
                    userId
                }
            })
            
            users.forEach(user => {
 
                if(user.rooms.includes(""+roomId)){
                    user.ws.send(JSON.stringify({
                        type:"chat",
                        message:message,
                        roomId
                    }))
                }
            });
        }
    })
})