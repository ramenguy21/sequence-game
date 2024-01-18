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
const game_rooms = [
  {
    name: "balorant",
    players: [],
    state: "AVAILABLE",
  },
  {
    name: "short-king",
    players: [],
    state: "AVAILABLE",
  },
  {
    name: "amroodz",
    players: [],
    state: "AVAILABLE",
  },
  {
    name: "cremegon",
    players: [],
    state: "AVAILABLE",
  },
];

//state of games that are ACTIVE
const active_games = [];

//cors policies :: TODO: Update these when deploying.
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//--- BEGIN SOCKET PROCESS LOGIC
io.on("connection", (socket) => {
  console.log("a user connected");
  //[EVENT] New game creation request.
  socket.on("create-game", (username, callback) => {
    //filter out the rooms that are available
    const available_rooms = game_rooms.filter(
      (room) => room.state === "AVAILABLE"
    );
    //if there are no rooms available, send an appropriate response and return
    if (!available_rooms.length) {
      callback("UNAVAILABLE");
      return;
    }
    //randomly select from the list of available rooms
    const selected_room =
      available_rooms[Math.floor(Math.random() * available_rooms.length)];

    //make the socket join the socketio room
    socket.join(selected_room.name);
    //acknowledge back to the client
    callback(selected_room.name);
    //increment the player count and update state in the room (BAD CODE, could probably be optimized by storing room index beforehand)
    const current_room_idx = game_rooms.findIndex(
      (room) => room.name === selected_room.name
    );
    game_rooms[current_room_idx].players.push(username);
    game_rooms[current_room_idx].state = "WAITING";
  });

  //[EVENT] Join a game that is waiting
  socket.on("join-game", (room_name, username, callback) => {
    //filter room
    const room_idx = game_rooms.findIndex((room) => room.name === room_name);

    //validation checks
    if (
      room_idx == -1 ||
      game_rooms[room_idx].players.length >= 8 ||
      game_rooms[room_idx].state !== "WAITING"
    ) {
      callback("INVALID_ROOM");
      return;
    }

    //have the socket join the room
    socket.join(room_name);

    //callback the list of players to the initiating socket
    callback(game_rooms[room_idx].players);

    //emit to other clients that a player has joined; remove the intiating socket from this call
    io.to(room_name).except(socket.id).emit("player-join", username);

    //append player in the local array
    game_rooms[room_idx].players.push(username);
  });

  //[EVENT] Intitate gameplay in the room
  socket.on("start-game", (room_name, callback) => {
    //room name validation
    const current_room = game_rooms.find((room) => room.name === room_name);
    if (!current_room || current_room.state !== "WAITING") {
      callback("INVALID_ROOM");
      return;
    }
    //player count validation
    if (
      current_room.players.length % 2 != 0 ||
      current_room.players.length % 3 != 0 ||
      current_room.players.length > 9 ||
      current_room.players.length <= 1
    ) {
      callback("INSUFFICENT_PLAYERS");
      return;
    }

    //set the room state
    current_room.state = "ACTIVE";

    //notify all the clients in the socketio room that the game has started
    //io.to(room_name).emit("game-start");

    //prepare the starting hand for each player

    //iterate over all the connected clients and send them their hand
  });

  //[EVENT]process various game actions on active room.
  socket.on("game-action", (room_name, player_name, action, callback) => {});
});
//--- END SOCKET PROCESS LOGIC

app.get("/", (req, res) => {
  res.send("Hey !");
});

server.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
