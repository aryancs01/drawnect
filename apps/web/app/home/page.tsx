"use client"
import { PencilIcon } from "lucide-react";
import { Button } from "@repo/ui/button"
import Image from "next/image";
import { useRouter } from "next/navigation";
"../../public/drawFinal.png"

export default function Home() {
    const router = useRouter();
    function redirectToSignin(){
        router.push("/signin")
    }
    function redirectToSignup(){
        router.push("signup")
    }
    function redirectToContent(){
        const name = localStorage.getItem("name");
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("token")
        if(!name && !email && !token){
            router.push("/signup")
        }else{
            router.push(`/dashboard/${name}/${email}`)
        }
    }
    return <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white md:px-10 pt-12">
        <div>
            <div className="flex justify-between ">
                <div className="text-blue-700 flex gap-3 items-center md:pl-24">
                    <PencilIcon />
                    <h3 className="text-3xl font-bold">Drawnnect</h3>
                </div>
                <div className="flex gap-3 md:pr-32">
                    <Button
                        variant="primary"
                        size="md"
                        text="Signup"
                        onclick={redirectToSignup}
                    />
                    <Button
                        variant="primary"
                        size="md"
                        text="Signin"
                        onclick={redirectToSignin}
                    />
                </div>
            </div>

            <div className="w-full pt-24 flex flex-col flex-wrap justify-center items-center">
                <h3 className="text-blue-900 text-6xl font-bold mb-5">Connect and Create Together</h3>
                <div className="text-blue-700 text-xl text-center max-w-4xl ">
                    Join our community of artists and collaborators. <br />
                    Draw, sketch, and bring your ideas to life in real-time with others from around the world.
                </div>
                
                <div className="mt-4 flex gap-5">
                    <Button
                            variant="primary"
                            size="lg"
                            text="Get Started ->"
                            onclick={redirectToContent}
                    />
                    <Button
                            variant="secondary"
                            size="lg"
                            text="Try Demo"
                    />
                </div>
            </div>
            <div className="mt-16 max-h-screen md:px-40">
                   <div className="bg-blue-200 h-screen rotate-3 rounded-2xl">
                        <div className="w-full md:h-full bg-white -rotate-3">
                            <Image className="rounded-md p-7"
                            src={"/drawFinal.png"}
                            layout="fill" 
                            objectFit="fill"
                            alt="demo image"
                            />
                        </div>
                    </div> 
                    <p className="text-center text-blue-400 mt-5">Canvas (Preview)</p>
            </div>
            <div className="h-60 text-black flex w-full items-end justify-center pl-14">
                 © 2025 Drawnnect. All rights reserved.
            </div>
        </div>
    </div>
}