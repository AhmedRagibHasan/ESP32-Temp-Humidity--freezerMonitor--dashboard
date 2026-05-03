//run command node server.js

const mqtt    = require('mqtt');
const express = require('express');
const app     = express();

app.use(express.static('public'));

const BROKER = 'mqtt://broker.hivemq.com';
const TOPIC  = 'jojo/freezer/sensors';
const PORT = process.env.PORT || 3000;

// In-memory store — last 20 readings
let readings = [];

// --- MQTT ---
const client = mqtt.connect(BROKER);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe(TOPIC, (err) => {
    if (!err) console.log('Subscribed to: ' + TOPIC);
  });
});

client.on('message', (topic, message) => {
  const data = JSON.parse(message.toString());
  data.received_at = new Date().toISOString();
  readings.push(data);
  if (readings.length > 20) readings.shift(); // keep last 20 only
  console.log('Received:', data);
});

// --- REST API ---
app.get('/api/latest', (req, res) => {
  res.json(readings[readings.length - 1] || {});
});

app.get('/api/history', (req, res) => {
  res.json(readings);
});

app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
});