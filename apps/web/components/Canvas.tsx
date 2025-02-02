import { useEffect, useRef, useState } from "react"
import { IconButton } from "./IconButton";
import { Circle, Pencil, PencilLine, RectangleHorizontalIcon, Text } from "lucide-react"
import { Game } from "../draw/Game";
import { useWindowSize } from "@react-hook/window-size";

export type tool = "circle" | "pencil" | "rect" | "text" | null;

export function Canvas({ roomId, socket }: {
    roomId: string,
    socket: WebSocket
}) {
    const [width,height] = useWindowSize();
    const [selectedTool, setSelectedTool] = useState<tool>(null);
    const [game,setGame] = useState<Game>();

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(()=>{
        game?.setTool(selectedTool)
    },[selectedTool,game])
    
    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current,roomId,socket)
            setGame(g);

            return ()=>{
                g.destroy()
            }
        }
    }, [canvasRef])

    return <div className="h-screen w-screen overflow-hidden">
        <canvas ref={canvasRef} width={width} height={height}></canvas>
        <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
    </div>

}

//problem when window resize, look react hook window

function Topbar({ selectedTool, setSelectedTool }: {
    selectedTool: tool
    setSelectedTool: (s: tool) => void
}) {
    return <div className=" flex gap-2 fixed top-10 left-1/2">
        <IconButton activated={selectedTool === "pencil"} onClick={() => {
            setSelectedTool("pencil")
        }} icon={<Pencil />} />
        <IconButton activated={selectedTool === "rect"} onClick={() => {
            setSelectedTool("rect")
        }} icon={<RectangleHorizontalIcon />} />
        <IconButton activated={selectedTool === "circle"} onClick={() => {
            setSelectedTool("circle")
        }} icon={<Circle />} />
        <IconButton activated={selectedTool === "text"} onClick={() => {
            setSelectedTool("text")
        }} icon={<Text />} />
    </div>
}