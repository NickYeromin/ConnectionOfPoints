import { json } from "express";
import WebSocketm, { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

console.log("✅✅✅СЕРВЕР ЗАПУЩЕН✅✅✅");

const clientsData = {};

let clientIdCounter = 0;

wss.on("connection", (ws) => {
	const clientId = clientIdCounter++;
	console.log(`✅Клиент подключился! ID:${clientId}`);

	clientsData[clientId] = {};

	ws.on("message", (msg) => {
		try {
			const data = JSON.parse(msg.toString());
			console.log("✉ Получено от клиента:", data);

			clientsData[clientId] = data;

			const broadcast = JSON.stringify(clientsData);
			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(broadcast);
				}
			});
		} catch (error) {
			console.error("❌❌❌Не валидный JSON:", msg.toString());
		}
	});

	ws.on("close", () => {
		console.log(`❌Клиент отключился! ID:${clientId}`);
		delete clientsData[clientId];

		const broadcast = JSON.stringify(clientsData);
		wss.clients.forEach((client) => {
			if (client.readyState === WebSocket.OPEN) {
				client.send(broadcast);
			}
		});
	});
});
