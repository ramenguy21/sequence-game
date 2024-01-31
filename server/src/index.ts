import { randomInt } from "crypto";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import Game from "./game";
import SocketStore from "./store";

const app = express();
const server = createServer(app);

//available rooms to join or create with, let's start with 4

//POSSIBLE STATES:
/*
  AVAILABLE
  WAITING (waiting for players, host has not started).
  ACTIVE (game is in progress)
*/
type Room = {
  name: string;
  players: Map<string, string>; //<name, token(from which the socket is identified)>
  state: string;
  game: Game | null;
};

const game_rooms: Room[] = [
  {
    name: "balorant",
    players: new Map(),
    state: "AVAILABLE",
    game: null,
  },
  {
    name: "short-king",
    players: new Map(),
    state: "AVAILABLE",
    game: null,
  },
  {
    name: "amroodz",
    players: new Map(),
    state: "AVAILABLE",
    game: null,
  },
  {
    name: "cremegon",
    players: new Map(),
    state: "AVAILABLE",
    game: null,
  },
];

//cors policies :: TODO: Update these when deploying.
const io = new Server(server, {
  cors: {
    origin: "*",
  },
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 2 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: true,
  },
});

//--- BEGIN SOCKET PROCESS LOGIC
io.on("connection", (socket) => {
  console.log("a user connected");
  //[EVENT] New game creation request.
  socket.on("create-game", (username: string, callback) => {
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
    game_rooms[current_room_idx].players.set(username, socket.id);
    game_rooms[current_room_idx].state = "WAITING";
  });

  //[EVENT] Join a game that is waiting
  socket.on("join-game", (room_name, username, callback) => {
    //filter room
    const room_idx = game_rooms.findIndex((room) => room.name === room_name);

    //validation checks
    if (
      room_idx === -1 ||
      game_rooms[room_idx].players.size >= 6 ||
      game_rooms[room_idx].state !== "WAITING"
    ) {
      callback("INVALID_ROOM");
      return;
    }

    //have the socket join the room
    socket.join(room_name);

    //callback the list of players to the initiating socket
    callback(Array.from(game_rooms[room_idx].players.keys()));

    //emit to other clients that a player has joined; remove the intiating socket from this call
    io.to(room_name).except(socket.id).emit("player-join", username);

    //append player in the local array
    game_rooms[room_idx].players.set(username, socket.id);
  });

  //[EVENT] Intitate gameplay in the room
  socket.on("start-game", (room_name, callback) => {
    //room name validation
    const current_room_idx = game_rooms.findIndex(
      (room) => room.name === room_name
    );
    const current_room = game_rooms[current_room_idx];

    console.log(current_room);

    if (current_room_idx === -1 || current_room.state !== "WAITING") {
      callback("INVALID_ROOM");
      return;
    }
    //player count validation
    if (
      !(
        (current_room.players.size % 2 === 0 ||
          current_room.players.size % 3 === 0) &&
        current_room.players.size < 9 &&
        current_room.players.size > 1
      )
    ) {
      console.log(current_room.players.size);
      callback("INSUFFICENT_PLAYERS");
      return;
    }

    //set the room state
    current_room.state = "ACTIVE";

    //create a new instance of the Game and prepare the starting hand for each player in constructor
    const new_game = new Game(Array.from(current_room.players.keys()));
    console.log(new_game.players);

    //notify all the clients in the socketio room that the game has started

    //iterate over all the connected clients and send them their hand
    new_game.players.forEach(async (player) => {
      const s_id = current_room.players.get(player.name);
      if (s_id === undefined) {
        console.error(
          "[Game] : Unexpected control flow on game creation",
          current_room
        );
      }
      //Not sure if socket id persists when joining a room ...
      await io
        .to(s_id as string)
        .timeout(10000)
        .emitWithAck("game-start", player.hand)
        .catch((e) => console.error(e));
    });

    //append the game instance to the room
    game_rooms[current_room_idx].game = new_game;

    //emit whoever's turn it is (god bless my mind good luck trying to decipher this after a month ...)
    const first_turn = new_game.get_player_details_by_index(
      new_game.current_turn_idx
    ).name;
    io.to(room_name).emit("turn-change", first_turn);
  });

  //[EVENT]process the move by the player
  socket.on(
    "end-turn",
    (
      room_name: string,
      player_name: string,
      data: { position: number[]; card: string },
      callback
    ) => {
      //get references to relevant data
      //put console logs in callback for proper client processing
      const room_idx = game_rooms.findIndex((room) => room.name === room_name);
      if (
        room_idx === -1 ||
        !Array.from(game_rooms[room_idx].players.keys()).includes(player_name)
      ) {
        console.log("Invalid end-turn call on room id: ", room_idx);
      }

      const next_player = game_rooms[room_idx].game?.handle_turn(
        player_name,
        data.card,
        data.position
      );
      if (!next_player) {
        console.error(
          "Could not find player while mutating game state, how did this even happen ? returning ...."
        );
        return;
      }
      //mutate board states of all clients except the initiating one.
      io.to(room_name)
        .except(game_rooms[room_idx].players.get(player_name) as string)
        .emitWithAck("player-move", {
          position: data.position,
          token: game_rooms[room_idx].game?.get_player_details_by_index(
            game_rooms[room_idx].game?.current_turn_idx || -1
          ).token,
        })
        .then(() => {
          //notify all clients that there has been a turn change
          io.to(room_name).emit("turn-change", next_player);
        })
        .catch((error) => console.error(error));
    }
  );
});
//--- END SOCKET PROCESS LOGIC

app.get("/", (req, res) => {
  res.send("Hey !");
});

server.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});

//----DEBUGGGING
setInterval(() => console.info(game_rooms), 10000);
