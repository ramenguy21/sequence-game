<script lang="ts">
  import { socket, username, players } from "../stores";

  //if a prop is passed from the router skip this initialization
  //and process the prop instead

  $socket.on("player-join", (player: string) => {
    console.log("[PLAYER JOIN]: " + player);
    //sucky solution, for some reason, events are being processed twice, need to figure out why ... maybe ssr was the issue ?
    if ($players.includes(player)) {
      return;
    }
    $players.push(player);
    //sucky svelte syntax, I think it does not do a deep diff..
    $players = $players;
  });
</script>

<div class="board">
  <h2>Players</h2>
  <ul>
    <li>{$username} (YOU)</li>
    {#each $players as player}
      <li>{player}</li>
    {/each}
  </ul>
</div>

<style>
  .board {
    text-align: center;
    height: 50%;
    background-color: whitesmoke;
    padding: 1rem;
  }
</style>
