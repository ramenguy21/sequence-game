import { randomInt } from "crypto";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);

//available rooms to join or create with, let's start with 4

//POSSIBLE STATES:
/*
  AVAILABLE
  WAITING (waiting for players, host has not started).
  ACTIVE (game is in progress)
*/
const rooms = [
  {
    name: "balorant",
    players: 0,
    state: "AVAILABLE",
  },
  {
    name: "short-king",
    players: 0,
    state: "AVAILABLE",
  },
  {
    name: "amroodz",
    players: 0,
    state: "AVAILABLE",
  },
  {
    name: "hussain-ahmed",
    players: 0,
    state: "AVAILABLE",
  },
];

//cors policies :: TODO: Update these when deploying.
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//--- BEGIN SOCKET PROCESS LOGIC
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("new-game", (username, callback) => {
    //filter out the rooms that are available
    const available_rooms = rooms.filter((room) => room.state === "AVAILABLE");
    //if there are no rooms available, send an appropriate response and return
    if (!available_rooms.length) {
      callback("UNAVAILABLE");
      return;
    }
    //randomly select from the list of available rooms
    const room_idx = Math.floor(Math.random() * available_rooms.length);
    const selected_room = available_rooms[room_idx];

    //make the socket join the socketio room
    socket.join(selected_room.name);
    //acknowledge back to the client
    callback(selected_room.name);
    //increment the player count and update room state in the room (BAD CODE, could probably be optimized by storing room index beforehand)
    const current_room = rooms.filter(
      (room) => room.name === selected_room.name
    )[0];
    current_room.players += 1;
    current_room.state = "WAITING";
  });

  socket.on("join-game", (room_id) => {
    console.log(room_id);
  });
});
//--- END SOCKET PROCESS LOGIC

app.get("/", (req, res) => {
  res.send("Hey !");
});

server.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
