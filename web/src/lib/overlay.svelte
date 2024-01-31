<script lang="ts">
  import {
    is_host,
    is_waiting,
    players,
    room_name,
    socket,
    username,
  } from "../stores";

  function handle_game_start() {
    $socket.emit("start-game", $room_name, (response: string) => {
      if (response === "INVALID_ROOM") {
        console.log("invalid room call, how did this even happen bro ?");
      } else if (response === "INSUFFICENT_PLAYERS") {
        console.log("Buddy, u don't have enough players, get more friends ...");
      } else {
        console.log("Socket has been fired, waiting for the game-start call");
      }
    });
  }
</script>

<div class="background">
  <div class="bg-slate-500 rounded p-4 mb-10 flex flex-col justify-center">
    <h1 class="text-center h1 text-xl font-bold text-white">
      Waiting for players
    </h1>
    <ul class="mt-4 text-white text-center">
      {#each $players as player}
        <li>{player === $username ? player + " (YOU)" : player}</li>
      {/each}
    </ul>
    {#if $is_host}
      <button
        on:click={handle_game_start}
        class="bg-green-500 text-white rounded p-2 self-center mt-4"
        >Start Game</button
      >{:else}
      <p class="text-white bg-red-300 p-2 rounded mt-4">
        Waiting for host to start the game (Why are they like this ?)
      </p>
    {/if}
  </div>
</div>

<style>
  .background {
    display: flex;
    position: fixed;
    justify-content: center;
    align-items: center;
    padding: 0;
    margin: 0;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    background: rgba(11, 143, 204, 0.76);
    z-index: 3;
  }
</style>
