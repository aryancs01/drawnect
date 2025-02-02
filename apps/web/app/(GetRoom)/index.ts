import axios from "axios";
import { HTTP_BACKEND } from "../../config";

type messageType = {
    slug: string;
    createdAt: string;
    id:string
}

export async function getAllRooms():Promise<messageType[]> {
    const messages:messageType[] = []

        try {
            const response = await axios.get(`${HTTP_BACKEND}/allChatRoom`,{
                headers:{
                    "Authorization":localStorage.getItem("token")
                }
            })

            for(let i=0;i<response.data.response.length;i++){
                const slug = response.data.response[i].slug;
                const createdAt = response.data.response[i].createdAt;
                const id = response.data.response[i].id;
                messages.push({slug:slug,createdAt:createdAt,id:id})
            }
            
        } catch (error) {
            
        }

    return messages
}