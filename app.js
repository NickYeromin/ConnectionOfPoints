const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ctx = canvas.getContext("2d");

ctx.background = "black";

const createDot = (x, y, radius, color) => {
	ctx.beginPath();
	const gradient = ctx.createRadialGradient(100, 100, 10, 150, 100, 100);
	gradient.addColorStop(0, "cyan");
	gradient.addColorStop(1, "gray");
	ctx.shadowBlur = 75; 
	ctx.shadowColor = "cyan"; 
	ctx.shadowOffsetX = 0;
	ctx.shadowOffsetY = 0;
	ctx.arc(x, y, radius, 0, 2 * Math.PI);
	ctx.fillStyle = gradient;
	ctx.fill();
};

const createLine = (x1, y1, x2, y2, offset) => {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.strokeStyle = "aqua";
	ctx.lineWidth = 3;

	const segments = 10; // Math.floor(Math.random() * 20)
	for (let i = 1; i < segments; i++) {
		const t = i / segments;

		const px = x1 + (x2 - x1) * t;
		const py = y1 + (y2 - y1) * t;

		const offset = (Math.random() - 0.5) * 40;
		ctx.lineTo(px + offset, py + offset);
	}

	ctx.lineTo(x2, y2);
	ctx.stroke();
};

const clearCanvas = () => {
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const posX = canvas.width / 2;
const posY = canvas.height / 2;

createDot(posX, posY);

canvas.addEventListener("click", (e) => {
	const x = e.clientX;
	const y = e.clientY;
	if (x >= posX - 50 && y >= posY - 50 && x <= posX + 50 && y <= posY + 50) {
		const win = window.open(
			"http://127.0.0.1:5500/index.html",
			"_blank",
			"myWindow",
			"width=400,height=300,resizable=yes, scrollbars=no"
		);
		win.resizeTo(400, 400);
	}
});

const socket = new WebSocket("ws://localhost:8080");

let lastX = window.screenLeft;
let lastY = window.screenTop;
let localX;
let localY;

socket.addEventListener("open", (event) => {
	socket.send(JSON.stringify({ x: lastX, y: lastY }));
});

socket.addEventListener("message", (event) => {
	console.log("Message from server ", event.data);

	const data = JSON.parse(event.data);
	// setInterval(() => {
	// 	clearCanvas();
	// 	createDot(posX, posY, 50, "yellow");

	// 	Object.values(data).forEach((val) => {
	// 		if (val.x !== lastX && val.y !== lastY) {
	// 			const targetGlobalX = val.x + 200; // т.к. окно 400x400
	// 			const targetGlobalY = val.y + 200;
	// 			localX = targetGlobalX - window.screenLeft;
	// 			localY = targetGlobalY - window.screenTop;

	// 			createLine(posX, posY, localX, localY);
	// 		}
	// 	});
	// }, 500);
	clearCanvas();

	Object.values(data).forEach((val) => {
		if (val.x !== lastX && val.y !== lastY) {
			const targetGlobalX = val.x + 200; // т.к. окно 400x400
			const targetGlobalY = val.y + 200;
			localX = targetGlobalX - window.screenLeft;
			localY = targetGlobalY - window.screenTop;

			createLine(posX, posY, localX, localY);
		}
	});
	createDot(posX, posY, 50, "yellow");
});

setInterval(() => {
	if (window.screenLeft !== lastX && window.screenTop !== lastY) {
		lastX = window.screenLeft;
		lastY = window.screenTop;

		socket.send(JSON.stringify({ x: lastX, y: lastY }));
	}
}, 100);
