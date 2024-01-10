<script>
  //export let current_hand = []
  const demo_hand = ["2h", "qc", "as", "6s", "3d", "7c", "kh"];
  const sdiv = 90 / demo_hand.length;
</script>

<div class="container">
  {#each demo_hand as card, index}
    <img
      style="--rot:{sdiv * index * -1}deg"
      alt="sequence playing card"
      src="/images/cards/{card}.svg"
    />
  {/each}
</div>

<style>
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
