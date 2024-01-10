<script>
  import { json } from "@sveltejs/kit";
  import { io } from "socket.io-client";
  import { onMount } from "svelte";
  /* async () => {
        const response = await fetch(
          "http://localhost:3000/new-game/" + username,
          {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json",
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            //body : []
          }
        );
        const res = await response.text();
        console.log(res); */
  let username = "";

  const socket = io("http://localhost:3000/");
</script>

<div class="text-white bg-black h-screen pt-12">
  <h1 class="font-bold text-center text-2xl">Sequence Game (weeeee)!</h1>
  <form class="flex flex-col w-1/4 m-auto mt-12">
    <label for="username">Enter Username</label>
    <input
      class="text-black my-1"
      bind:value={username}
      type="text"
      id="username"
    />
    <button
      on:click={() => {
        socket.emit("new-game", username);
      }}
      class="bg-cyan-500 text-white mt-4 w-1/2 m-auto rounded p-2"
      >Start Game</button
    >
  </form>
</div>

<style>
</style>
