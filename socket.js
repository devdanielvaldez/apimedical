const WebSocket = require('ws');

let wss;

const initWebSocket = (server) => {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log('Cliente conectado');

        ws.on('message', (message) => {
            console.log(`Mensaje recibido: ${message}`);
        });

        ws.on('close', () => {
            console.log('Cliente desconectado');
        });
    });

    wss.on('error', (error) => {
        console.error('Error en WebSocket:', error);
    });
};

const sendNotification = (message) => {
    if (!wss) return;

    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ message }));
        }
    });
};

module.exports = { initWebSocket, sendNotification };