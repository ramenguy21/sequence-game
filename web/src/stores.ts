import { Socket, io } from "socket.io-client";
import { readable, writable, type Readable, type Writable } from "svelte/store";



//WARN: A connection is established when the user lands on the page
//FIX: Only establish the connection when the user has entered details
//NOTE: Type inference does not work if initializing as io().
export const socket : Readable<Socket> = readable(io("http://localhost:3000/"));
export const room_name : Writable<string> = writable("");
export const username : Writable<string> = writable("");
//is the client responsible for hosting the game ?
export const is_host : Writable<boolean> = writable(false);
//is the client waiting for game start ? -> (works in conjunction to the game host).
export const is_waiting : Writable<boolean> = writable(false);
//who's turn is it ?
export const current_turn : Writable<string> = writable("");
//a log of all the turn actions taken on the client.
export const turn_log : Readable<{position : number[], card : string}[]> = readable([])
//idk if this can be done through passing route props, probably not since sveltekit router is page based
//hence, it makes sense to store list of players in a global state since multiple components are mutating them.
export const players : Writable<string[]> = writable([])
//tracking mouse position in the store
export const mouse_position = readable({x:0, y:0}, (set) => {
    document.body.addEventListener("mousemove", move);

    function move(event : MouseEvent) {
        set({x : event.clientX, y : event.y})
    }

    return () => {
		document.body.removeEventListener("mousemove", move);
	}
})

//dispatches don't seem to work so using a writable store for now, should probably figure out a better solution to this ...
export const is_placed = writable(false);

