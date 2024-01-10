import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("new-game", (username, callback) => {
    console.log(username);
  });

  socket.on("join-game", (room_id) => {
    console.log(room_id);
  });
});

app.get("/", (req, res) => {
  res.send("Hey !");
});

//Req: username : string || Res: room-id : string
app.post("/new-game/:username", (req, res) => {
  console.log(btoa(req.params.username));
  res.send({ id: btoa(req.params.username) });
});

server.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
