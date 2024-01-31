<script lang="ts">
  import Board from "$lib/board.svelte";
  import Leaderboard from "$lib/leaderboard.svelte";
  import Hand from "$lib/hand.svelte";
  import Overlay from "$lib/overlay.svelte";
  import { current_turn, is_waiting, socket, username } from "../../stores";

  let selected_card = "";

  $socket.on("turn-change", (player) => {
    $current_turn = player;
  });
</script>

<h1>Sequence Game</h1>
<div class="row">
  {#if $is_waiting}
    <Overlay />
  {/if}
  <Leaderboard />
  <Board sel_card={selected_card} />
  <div class="col">
    <div class="col">
      <h2>Draw Pile</h2>
      <img width="150" src="/images/cards/back.svg" alt="card_back" />
      <button>Draw</button>
    </div>
    <Hand bind:selected_card />
  </div>
</div>

<style>
  :global(body) {
    overflow: hidden;
  }
  :global(.row) {
    display: flex;
    flex-direction: row;
  }

  :global(.col) {
    display: flex;
    flex-direction: column;
  }

  :global(body) {
    background-color: orange;
  }

  .row {
    width: 100%;
    justify-content: center;
  }

  h1 {
    text-align: center;
  }

  .col {
    flex: 0 0 20%;
    width: 100%;
    text-align: center;
    align-content: center;
    align-items: center;
  }

  .col > button {
    margin-top: 1rem;
    background-color: white;
    border: none;
    padding: 0.5rem;
    border-radius: 0.2rem;
  }
</style>
