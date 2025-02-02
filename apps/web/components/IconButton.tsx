import { ReactNode } from "react";

export function IconButton({
    icon,onClick,activated
}:{
    icon:ReactNode;
    onClick:()=>void;
    activated:boolean
}) {
    return <div onClick={onClick} className={`bg-black hover:bg-gray-500 cursor-pointer rounded-full border p-2 ${activated?"bg-gray-500":"bg-black"}`}>
        {icon}
    </div>
}