<script>
  import Board from "$lib/board.svelte";
  import Leaderboard from "$lib/leaderboard.svelte";
  import Hand from "$lib/hand.svelte";
</script>

<h1>Sequence Game</h1>
<div class="row">
  <Leaderboard />
  <Board />
  <div class="col">
    <div class="col">
      <h2>Draw Pile</h2>
      <img width="150" src="/images/cards/back.svg" alt="card_back" />
      <button>Draw</button>
    </div>
    <Hand />
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
