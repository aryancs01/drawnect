declare global {
    namespace Express {
        export interface Request {
            userId?: string
        }
    }
}
import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import bcrypt from "bcrypt";
import { middleware } from "./middleware";
import { CreateUserSchema, SigniSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
    const data = CreateUserSchema.safeParse(req.body);
    if (!data.success) {
        console.log(data.error)
        res.status(403).json({
            message: "Incorrect Input"
        })
        return;
    }

    const { name, username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 4);

    try {
        const response = await prismaClient.user.create({
            data: {
                email: username,
                password: hashedPassword,
                name
            }
        })

        const token = jwt.sign({
            responseId: response.id
        }, JWT_SECRET);

        res.status(200).json({
            token: token,
            name: response.name,
            emailId: response.email
        })
    } catch (error) {
        console.log(error)
        res.status(401).json({
            message: "User already exists with this email"
        })
    }
})

app.post("/signin", async (req, res) => {
    const data = SigniSchema.safeParse(req.body);
    if (!data.success) {
        res.status(403).json({
            message: "Incorrect Input"
        })
        return;
    }

    try {
        const { username, password } = req.body;

        const response = await prismaClient.user.findFirst({
            where: {
                email: username
            }
        })

        if (!response) {
            res.status(403).json({
                message: "Not Signin, Go to Signup"
            })
            return;
        }

        const comparePassword = await bcrypt.compare(password, response.password);

        if (!comparePassword) {
            res.status(403).json({
                message: "Incorrect credentials"
            })
            return;
        }

        const token = jwt.sign({
            responseId: response.id
        }, JWT_SECRET);

        res.status(200).json({
            token: token,
            name: response.name,
            emailId: response.email
        })
    } catch (error) {
        res.status(401).json({
            message: "Internal Server Error"
        })
    }

})

app.post("/create-room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(403).json({
            message: "Incorrect Input"
        })
        return;
    }
    try {
        const name = parsedData.data.name;
        const userId = req.userId;

        const response = await prismaClient.room.create({
            //@ts-ignore
            data: {
                slug: name,
                adminId: userId
            }
        })
        res.status(200).json({
            roomId: response.id
        })
    } catch (error) {
        res.status(411).json({
            message: "Internal Server Error"
        })
    }
})

app.get("/allChatRoom", middleware, async (req, res) => {
    const userId = req.userId;

    try {
        const response = await prismaClient.room.findMany({
            where: {
                adminId: userId
            },
            select: {
                slug: true,
                id: true,
                createdAt: true,
                adminId: false
            }
        })

        if (!response) {
            res.json({
                message: "Not Found"
            })
            return;
        }

        res.status(200).json({
            response
        })

        console.log(response)
    } catch (error) {
        res.status(401).json({
            message: "Internal Server Error"
        })
    }


})

app.get("/chat/:roomId", async (req, res) => {
    const roomId = Number(req.params.roomId);
    const message = await prismaClient.chat.findMany({
        where: {
            roomId: roomId
        },
        orderBy: {
            id: "desc"
        },
        take: 50
    })

    res.json({
        message
    })
})

app.get("/room/:slug", async (req, res) => {
    try {
        const slug = req.params.slug;
        const roomId = await prismaClient.room.findFirst({
            where: {
                slug
            },select:{
                id:true,
                createdAt:false,
                slug:false,
                adminId:false
            }
        })

        if(roomId){
            res.status(200).json({
                roomId
            })
        }else{
            res.status(401).json({
                message:"this room doesn't exist"
            })
        }
        
    } catch (error) {
        res.status(402).json({
            message:"Internal Server Error"
        })
    }

})

app.get("/roomIdVerified",(req,res)=>{
    
})

app.listen(3001, () => {
    console.log("server connected ", 3001)
});