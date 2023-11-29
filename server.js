const express = require("express");
const path = require("path");
const expressWs = require("express-ws");
const SerialPort = require("serialport");
const axios = require("axios");

const app = express();
const port = 3000;
const raspberryPiIpAddress = "http://192.168.1.93:3000";
// Enable WebSocket support in Express
const { getWss, applyTo } = expressWs(app);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Define a route to serve the HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

let newTempSetting;
// Defining a route to get the set temperature
app.post("/setTemp", express.json(), (req, res) => {
  newTempSetting = req.body.number;
  console.log("Received data from client:", newTempSetting);
  res.json({ success: true });
});

const parsers = SerialPort.parsers;
const parser = new parsers.Readline({
  delimiter: "\r\n",
});
var arduinoPort = new SerialPort("COM3", {
  baudRate: 9600,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  flowControl: false,
});
arduinoPort.pipe(parser);

// WebSocket connection handling
app.ws("/", (ws, req) => {
  console.log("WebSocket connected");
  ws.on("message", (data) => {
    const parsedData = JSON.parse(data);
    console.log("Received data from client:", parsedData);

    // Handle the data from the client
    if (parsedData.number !== undefined) {
      // Do something with the received number
      console.log("Received new temperature setting:", parsedData.number);
    }
  });

  ws.on("close", () => {
    console.log("WebSocket disconnected");
  });

  parser.on("data", processData);
  function processData(data) {
    const currentRoomtemperature = parseFloat(data);
    ws.send(JSON.stringify({ currentRoomtemperature }));
    console.log("Current Room Temperature: ", currentRoomtemperature);
    console.log("The new set temperature", newTempSetting);
    if (newTempSetting > currentRoomtemperature) {
      console.log("Time to turn on heater!");
      heaterOn();
      coolerOff();
    } else if (newTempSetting < currentRoomtemperature) {
      console.log("Time to turn off heater! Maybe turn on cooler?!");
      heaterOff();
      coolerOn();
    } else {
      console.log("It's pleasant temperature, no heater no cooler!");
      heaterOff();
      coolerOff();
    }
  }
});

// Heater:
async function heaterOn() {
  try {
    const response = await axios.get(`${raspberryPiIpAddress}/turnOnR1`);
  } catch (error) {
    console.error("Error fetching sensor data:", error.message);
  }
}

async function heaterOff() {
  try {
    const response = await axios.get(`${raspberryPiIpAddress}/turnOffR1`);
  } catch (error) {
    console.error("Error fetching sensor data:", error.message);
  }
}

// Cooler:
async function coolerOn() {
  try {
    const response = await axios.get(`${raspberryPiIpAddress}/turnOnR2`);
  } catch (error) {
    console.error("Error fetching sensor data:", error.message);
  }
}

async function coolerOff() {
  try {
    const response = await axios.get(`${raspberryPiIpAddress}/turnOffR2`);
  } catch (error) {
    console.error("Error fetching sensor data:", error.message);
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
