"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SocketStore {
    constructor() {
        this.store = new Map();
    }
    addSocket(name, socket) {
        this.store.set(name, socket);
    }
    findSocket(name) {
        const socket = this.store.get(name);
        if (socket) {
            return socket;
        }
        throw new Error("Invalid socket access");
    }
}
exports.default = SocketStore;
