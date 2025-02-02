import axios from "axios";

export async function getExistingShapes(roomId:string){
    const res =await axios.get("http://localhost:3001/chat/"+roomId);
    const messages = res.data.message;

    const shapes = messages.map((msg:{message:string}) =>{
            const messageData = JSON.parse(msg.message)
            return messageData.shape
    })

    return shapes;
}