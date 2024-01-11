<script>
  import { username } from "../stores";
</script>

<div class="board">
  <h2>Players</h2>
  <ul>
    <li>{$username}</li>
    <li>Player 2</li>
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
