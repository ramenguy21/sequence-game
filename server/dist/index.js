"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const game_1 = __importDefault(require("./game"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const game_rooms = [
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
const io = new socket_io_1.Server(server, {
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
    socket.on("create-game", (username, callback) => {
        //filter out the rooms that are available
        const available_rooms = game_rooms.filter((room) => room.state === "AVAILABLE");
        //if there are no rooms available, send an appropriate response and return
        if (!available_rooms.length) {
            callback("UNAVAILABLE");
            return;
        }
        //randomly select from the list of available rooms
        const selected_room = available_rooms[Math.floor(Math.random() * available_rooms.length)];
        //make the socket join the socketio room
        socket.join(selected_room.name);
        //acknowledge back to the client
        callback(selected_room.name);
        //increment the player count and update state in the room (BAD CODE, could probably be optimized by storing room index beforehand)
        const current_room_idx = game_rooms.findIndex((room) => room.name === selected_room.name);
        game_rooms[current_room_idx].players.set(username, socket.id);
        game_rooms[current_room_idx].state = "WAITING";
    });
    //[EVENT] Join a game that is waiting
    socket.on("join-game", (room_name, username, callback) => {
        //filter room
        const room_idx = game_rooms.findIndex((room) => room.name === room_name);
        //validation checks
        if (room_idx === -1 ||
            game_rooms[room_idx].players.size >= 6 ||
            game_rooms[room_idx].state !== "WAITING") {
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
        const current_room_idx = game_rooms.findIndex((room) => room.name === room_name);
        const current_room = game_rooms[current_room_idx];
        console.log(current_room);
        if (current_room_idx === -1 || current_room.state !== "WAITING") {
            callback("INVALID_ROOM");
            return;
        }
        //player count validation
        if (!((current_room.players.size % 2 === 0 ||
            current_room.players.size % 3 === 0) &&
            current_room.players.size < 9 &&
            current_room.players.size > 1)) {
            console.log(current_room.players.size);
            callback("INSUFFICENT_PLAYERS");
            return;
        }
        //set the room state
        current_room.state = "ACTIVE";
        //create a new instance of the Game and prepare the starting hand for each player in constructor
        const new_game = new game_1.default(Array.from(current_room.players.keys()));
        console.log(new_game.players);
        //notify all the clients in the socketio room that the game has started
        //iterate over all the connected clients and send them their hand
        new_game.players.forEach((player) => __awaiter(void 0, void 0, void 0, function* () {
            const s_id = current_room.players.get(player.name);
            if (s_id === undefined) {
                console.error("[Game] : Unexpected control flow on game creation", current_room);
            }
            //Not sure if socket id persists when joining a room ...
            yield io.to(s_id).emitWithAck("game-start", player.hand);
        }));
        //append the game instance to the room
        game_rooms[current_room_idx].game = new_game;
        //emit whoever's turn it is (god bless my mind good luck trying to decipher this after a month ...)
        const first_turn = new_game.get_player_details_by_index(new_game.current_turn_idx).name;
        io.to(room_name).emit("turn-change", first_turn);
    });
    //[EVENT]process the move by the player
    socket.on("end-turn", (room_name, player_name, data, callback) => {
        var _a, _b, _c;
        //get references to relevant data
        //put console logs in callback for proper client processing
        const room_idx = game_rooms.findIndex((room) => room.name === room_name);
        if (room_idx === -1 ||
            !Array.from(game_rooms[room_idx].players.keys()).includes(player_name)) {
            console.log("Invalid end-turn call on room id: ", room_idx);
        }
        const next_player = (_a = game_rooms[room_idx].game) === null || _a === void 0 ? void 0 : _a.handle_turn(player_name, data.card, data.position);
        if (!next_player) {
            console.error("Could not find player while mutating game state, how did this even happen ? returning ....");
            return;
        }
        //mutate board states of all clients except the initiating one.
        io.to(room_name)
            .except(game_rooms[room_idx].players.get(player_name))
            .emitWithAck("player-move", {
            position: data.position,
            token: (_b = game_rooms[room_idx].game) === null || _b === void 0 ? void 0 : _b.get_player_details_by_index(((_c = game_rooms[room_idx].game) === null || _c === void 0 ? void 0 : _c.current_turn_idx) || -1).token,
        })
            .then(() => {
            //notify all clients that there has been a turn change
            io.to(room_name).emit("turn-change", next_player);
        })
            .catch((error) => console.error(error));
    });
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
