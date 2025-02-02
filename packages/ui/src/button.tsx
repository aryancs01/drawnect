interface PropsTypes {
    text:string;
    variant:"primary" | "secondary"|"loading"|"same1"|"same2";
    size:"md" | "sm" | "lg" | "xl";
    onclick?:()=>void;
}

const variantStyle={
    "primary":"bg-blue-600 px-5 py-2 rounded-sm cursor-pointer hover:bg-blue-400",
    "loading":"bg-blue-400 px-5 py-2 rounded-sm cursor-pointer hover:bg-blue-400",
    "secondary":"bg-white text-blue-600 px-4 py-2 rounded-sm cursor-pointer hover:bg-slate-200 ",
    "same1":"bg-white text-black px-4 py-1 w-full",
    "same2":"bg-gray-300 text-gray-500 px-4 py-1 w-full"
}


export function Button({text,variant,size,onclick}:PropsTypes){
    const containerStyle = `${variantStyle[variant]} text-${size}`
    return <button onClick={onclick} className={`${containerStyle}`}> 
        {text}
    </button>
}