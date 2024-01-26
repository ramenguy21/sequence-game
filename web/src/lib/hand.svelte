<script lang="ts">
  import { mouse_position } from "../stores";

  //export let current_hand = []
  const demo_hand = ["2h", "qc", "as", "6s", "3d", "7c", "kh"];
  const sdiv = 90 / demo_hand.length;

  export let selected_card = "";
</script>

<div class="container">
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  {#each demo_hand as card, index}
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
