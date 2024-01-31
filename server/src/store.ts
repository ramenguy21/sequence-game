import { Socket } from "socket.io";

class SocketStore {
    store: Map<string, Socket>;

    constructor() {
        this.store = new Map();
    }

    addSocket(name : string, socket : Socket) {
        this.store.set(name, socket)
    }   

    findSocket(name : string) : Socket {
        const socket = this.store.get(name);
        if(socket) {
            return socket
        }
        throw new Error("Invalid socket access")
    }
}

export default SocketStore