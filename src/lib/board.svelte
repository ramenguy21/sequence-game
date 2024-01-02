<script>
  const grid = [
    ["f", "10s", "qs", "ks", "as", "2d", "3d", "4d", "5d", "f"],
    ["9s", "10h", "9h", "8h", "7h", "6h", "5h", "4h", "3h", "6d"],
    ["8s", "qh", "7d", "8d", "9d", "10d", "qd", "kd", "2h", "7d"],
    ["7s", "kh", "6d", "2c", "ah", "kh", "qh", "ad", "2s", "8d"],
    ["6s", "ah", "5d", "3c", "4h", "3h", "10h", "ac", "3s", "9d"],
    ["5s", "2c", "4d", "4c", "5h", "2h", "9h", "kc", "4s", "10d"],
    ["4s", "3c", "3d", "5c", "6h", "7h", "8h", "qc", "5s", "qd"],
    ["3s", "4c", "2d", "6c", "7c", "8c", "9c", "10c", "6s", "kd"],
    ["2s", "5c", "as", "ks", "qs", "10s", "9s", "8s", "7s", "ad"],
    ["f", "6c", "7c", "8c", "9c", "10c", "qc", "kc", "ac", "f"],
  ];
</script>

<div class="wrapper">
  {#each grid as row}
    {#each row as card}
      <img class="card" src="/images/cards/{card}.svg" alt={card} />
    {/each}
  {/each}
</div>

<style>
  .wrapper {
    display: grid;
    grid-template-columns: repeat(10, 110px);
    grid-template-rows: repeat(10, 80px);
    justify-content: center;
    align-items: center;
  }

  .card {
    width: 150px;
    height: 100px;
    transform: rotate(90deg);
  }
</style>
