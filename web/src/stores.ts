import { Socket, io } from "socket.io-client";
import { writable, type Writable } from "svelte/store";

//WARN: A connection is established when the user lands on the page
//FIX: Only establish the connection when the user has entered details
//NOTE: Type inference does not work here.
export const socket : Writable<Socket> = writable(io("http://localhost:3000/"));
export const room_name : Writable<string> = writable("");
export const username : Writable<string> = writable("");