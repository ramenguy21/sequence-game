<script lang="ts">
  import { json } from "@sveltejs/kit";
  import { io } from "socket.io-client";
  import { onMount } from "svelte";
  import {
    room_name,
    socket,
    username,
    players,
    mouse_position,
    is_waiting,
    is_host,
  } from "../stores";
  import { goto } from "$app/navigation";

  $: mode = "create"; //create || join
  //need a proper way to check whether socket is connected to server and update that in DOM
  $: is_connected = true;

  function create_game() {
    $socket.emit("create-game", $username, (response: string) => {
      console.log(response);
      if (response !== "UNAVAILABLE") {
        $room_name = response;
        goto("/game").then(() => {
          $is_waiting = true;
          $is_host = true;
        });
      }
    });
  }

  function join_game() {
    $socket.emit(
      "join-game",
      $room_name,
      $username,
      (response: string[] | string) => {
        //response is expected to be an string array
        //append that to the global value
        if (response !== "UNAVAILABLE") {
          $players.push(...response);
          goto("/game").then(() => {
            $is_host = false;
            $is_waiting = true;
          });
        }
      }
    );
  }
</script>

<div class={"text-white bg-black h-screen pt-12"}>
  <h1 class="font-bold text-center text-2xl">Sequence Game (weeeee)!</h1>
  {#if is_connected}
    <form
      class={mode === "create" ? "flex flex-col w-1/4 m-auto mt-12" : "hidden"}
    >
      <div class="flex flex-col">
        <label for="username">Enter Username</label>
        <input
          class="text-black my-1"
          bind:value={$username}
          type="text"
          id="username"
        />
      </div>
      <div class="flex flex-row">
        <button
          on:click={create_game}
          class="bg-cyan-500 text-white mt-4 w-1/2 m-auto rounded p-2"
          >Start Game</button
        >
        <button
          on:click={() => {
            mode = "join";
          }}
          class="my-4 bg-amber-500 text-white mt-4 w-1/5 text-sm m-auto rounded p-2"
          >Join a game</button
        >
      </div>
    </form>

    <form
      class={mode === "join" ? "flex flex-col w-1/4 m-auto mt-12" : "hidden"}
    >
      <div class="my-2 flex flex-col">
        <label for="username">Enter Username</label>
        <input
          class="text-black my-1"
          bind:value={$username}
          type="text"
          id="username"
        />
      </div>
      <div class="my-2 flex flex-col">
        <label for="room_id">Enter Room Name</label>
        <input
          class="text-black my-1"
          bind:value={$room_name}
          type="text"
          id="room_id"
        />
      </div>
      <div class="flex flex-row my-2 space-x-4">
        <button
          on:click={join_game}
          class="bg-cyan-500 text-white mt-4 w-1/2 m-auto rounded p-2"
          >Join Game</button
        >
        <button
          on:click={() => {
            mode = "create";
          }}
          class="my-4 bg-amber-500 text-white mt-4 w-1/5 text-sm m-auto rounded p-2"
          >Create a game ?</button
        >
      </div>
    </form>
  {:else}
    <p>Connecting to server .... Plz Wait</p>
  {/if}
</div>

<style>
</style>
