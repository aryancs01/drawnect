
import { tool } from "../components/Canvas";
import { getExistingShapes } from "./http";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    startX: number;
    startY: number;
    endX: number;
    endY: number
} | {
    type: "text";
    inputValue: string;
    textX: number
    textY: number
}

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D
    private existingShapes: Shape[]
    private roomId: string
    private clicked: boolean
    private startX: number
    private startY: number
    private socket: WebSocket
    private selectedTool: tool = "circle"
    private input: HTMLInputElement | null = null;
    private inputValue: string = "";
    private hasInput: boolean = false;
    private textX: number = 0
    private textY: number = 0
    private currentScale: number = 1

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!
        this.existingShapes = [];
        this.roomId = roomId
        this.socket = socket;
        this.clicked = false;
        this.startX = 0;
        this.startY = 0
        this.init();
        this.initHandlers();
        this.initMouseHandler();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)

        this.canvas.removeEventListener("dblclick", this.doubleClickHandler);

        this.canvas.removeEventListener("keydown",this.keydownHandler)
    }

    setTool(tool: tool) {
        this.selectedTool = tool
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId)
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "chat") {
                const parsedShape = JSON.parse(message.message)
                this.existingShapes.push(parsedShape.shape)
                this.clearCanvas()
            } else {
                window.location.href = "/errorpage"
            }

        }
    }

    clearCanvas() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.setTransform(this.currentScale, 0, 0, this.currentScale, 0, 0);
        
        this.ctx.fillStyle = "rgba(0,0,0)"
        this.ctx?.fillRect(0, 0, this.canvas.width, this.canvas.height)
        
        this.existingShapes.map(shape => {
            if (shape.type === "rect") {
                this.ctx.strokeStyle = "rgba(255,255,255)"
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
            } else if (shape.type === "circle") {
                this.ctx.beginPath()
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2)
                this.ctx.stroke();
                this.ctx.closePath();
            }
            else if (shape.type === "pencil") {
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(shape.endX, shape.endY)
                this.ctx.stroke()
            } else if (shape.type === "text") {
                this.drawText(shape.inputValue, shape.textX, shape.textY)
            }
        })
    }

    drawText(inputValue: string, x: number, y: number) {
        this.ctx.font = "34px mono";
        this.ctx.strokeStyle = "rgba(255,255,255)";
        this.ctx.strokeText(inputValue, x, y);
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true;
        const { x, y } = this.transformCoordinates(e.clientX, e.clientY);
        this.startX = x;
        this.startY = y;
    }

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;
        const { x, y } = this.transformCoordinates(e.clientX, e.clientY);
        const width = x - this.startX;
        const height = y - this.startY;

        let shape: Shape | null = null;

        //@ts-ignore
        const selectedTool = this.selectedTool;

        if (selectedTool === "rect") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                height,
                width
            }
            this.existingShapes.push(shape)
        } else if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;

            shape = {
                type: "circle",
                radius: radius,
                centerX: this.startX + radius,
                centerY: this.startY + radius
            }
            this.existingShapes.push(shape)
        } else if (selectedTool === "pencil") {
            shape = {
                type: "pencil",
                startX: this.startX,
                startY: this.startY,
                endX: x,
                endY: y
            }
            this.existingShapes.push(shape)
        }

        if (!shape) {
            return;
        }


        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape: shape
            }),
            roomId: +this.roomId
        }))
    }

    mouseMoveHandler = (e: MouseEvent) => {
    if (this.clicked) {
        const { x, y } = this.transformCoordinates(e.clientX, e.clientY);
        const width = x - this.startX;
        const height = y - this.startY;
        this.clearCanvas();
        this.ctx.strokeStyle = "rgba(255,255,255)"

        if (this.selectedTool === "rect") {
            this.ctx?.strokeRect(this.startX, this.startY, width, height);
        } else if (this.selectedTool === "circle") {
            const radius = Math.max(width, height) / 2
            const centerX = this.startX + radius
            const centerY = this.startY + radius
            this.ctx.beginPath()
            this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2)
            this.ctx.stroke();
            this.ctx.closePath();
        } else if (this.selectedTool === "pencil") {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
            this.ctx.lineTo(x, y); // Use transformed coordinates
            this.ctx.stroke()
        }
    }
}

    doubleClickHandler = (e: MouseEvent) => {
        if (this.selectedTool === "text") {
            if (this.hasInput) return;

            const { x, y } = this.transformCoordinates(e.clientX, e.clientY);
            this.textX = x;
            this.textY = y;
            this.ctx.font = "34px serif";
            this.input = document.createElement('input');
            this.input.type = 'text';
            this.input.style.position = 'fixed';
            this.input.style.left = `${this.textX - 4}px`;
            this.input.style.top = `${this.textY - 4}px`;
            this.hasInput = true;
            this.input.onkeydown = this.handleEnter.bind(this);
            document.body.appendChild(this.input);
            this.input.focus();
        }
    };

    handleEnter = (e: KeyboardEvent) => {
        if (!this.input) {
            return;
        }

        if (e.key === 'Enter') {
            const inputValue = this.input?.value;
            this.inputValue += inputValue?.toString();
            this.ctx.strokeText(this.inputValue, this.textX, this.textY)
            document.body.removeChild(this.input);
            this.hasInput = false
            let shape: Shape | null = null

            shape = {
                type: 'text',
                inputValue: this.inputValue,
                textX: this.textX,
                textY: this.textY
            }
            this.existingShapes.push(shape)
            this.clearCanvas();

            this.socket.send(JSON.stringify({
                type: "chat",
                message: JSON.stringify({
                    shape: shape
                }),
                roomId: +this.roomId
            }))
            this.inputValue = ""
        }
    };

    keydownHandler = (e: KeyboardEvent) => {
        if (e.key === "Shift") {
            this.currentScale *= 1.1;
            this.ctx.setTransform(this.currentScale, 0, 0, this.currentScale, 0, 0);
            this.clearCanvas();
        }

        if (e.key === "Alt") {
            this.currentScale *= 0.8;
            this.ctx.setTransform(this.currentScale, 0, 0, this.currentScale, 0, 0);
            this.clearCanvas();
        }
    }

    transformCoordinates(clientX: number, clientY: number) {
        const rect = this.canvas.getBoundingClientRect();

        const x = (clientX - rect.left) / this.currentScale;
        const y = (clientY - rect.top) / this.currentScale;

        return { x, y };
    }


    initMouseHandler() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)

        this.canvas.addEventListener("dblclick", this.doubleClickHandler)

        document.body.addEventListener("keydown", this.keydownHandler);
    }
}