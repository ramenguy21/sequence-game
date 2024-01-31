<script lang="ts">
  import {
    mouse_position,
    is_placed,
    is_waiting,
    socket,
    current_turn,
    room_name,
    username,
  } from "../stores";

  let hand = ["2h", "qc", "as", "6s", "3d", "7c", "kh"];
  const sdiv = 90 / hand.length;

  $socket.on("game-start", (starting_hand, cb) => {
    $is_waiting = false;
    console.log("[EVENT] Game has been started !");
    hand = starting_hand;
    cb("done");
  });

  $: {
    const value = $is_placed;
    handle_card_placed();
  }
  //card has been placed, pop from the array and rearrange
  function handle_card_placed() {
    hand.forEach((card, index) => {
      if (card === selected_card) {
        //remove it
        hand.splice(index, 1);
        selected_card = "";
      }
    });
    $is_placed = false;
  }

  export let selected_card = "";
</script>

<div class="container">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  {#each hand as card, index}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      on:dragstart={() => {
        selected_card = card;
      }}
      on:mouseup={() => {
        selected_card = "";
      }}
      class={selected_card === card ? "draggable" : ""}
      style={selected_card === card
        ? "--x:" + $mouse_position.x + "px; --y:" + $mouse_position.y + "px"
        : ""}
    >
      {#if selected_card === card}
        <img alt="sequence playing card" src="/images/cards/{card}.svg" />
      {:else}
        <img
          style="--rot:{sdiv * index * -1}deg"
          alt="sequence playing card"
          src="/images/cards/{card}.svg"
        />
      {/if}
    </div>
  {/each}
</div>

<style>
  .draggable {
    position: fixed;
    width: 8rem;
    height: 8rem;
    top: calc(var(--y) - 4rem);
    left: calc(var(--x) - 4rem);
  }

  .draggable > img {
    position: absolute;
  }
  .container {
    width: 5rem;
    height: 5rem;
    margin: 0;
    position: absolute;
    z-index: 1;
    right: 0rem;
    bottom: 0rem;
  }
  img {
    position: absolute;
    width: 8rem;
    height: 8rem;
    top: calc(-8rem * cos(var(--rot)));
    left: calc(12rem * sin(var(--rot)));
    max-width: 100%;
    bottom: 0;
    transform: rotate(var(--rot));
    transition: 0.2s;
  }

  img:hover {
    top: calc(-10rem * cos(var(--rot)));
    left: calc(14rem * sin(var(--rot)));
  }
</style>
