<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import {
    current_turn,
    is_placed,
    room_name,
    socket,
    turn_log,
    username,
  } from "../stores";

  export let sel_card = "";
  //let dispatch = createEventDispatcher();
  $socket.on(
    "player-move",
    (data: { position: number[]; token: string }, cb) => {
      console.log("Got player move !");

      if (
        token_array.includes(
          grid[data.position[0]][data.position[1]].at(-1) || ""
        )
      ) {
        console.info("Detected a duplicate call for player-move");
        cb("DONE");
      } else {
        grid[data.position[0]][data.position[1]] += data.token;
        cb("DONE");
      }
    }
  );

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

  //possible token value to check at -1 index
  const token_array = ["r", "g", "b"];
</script>

<div class="wrapper">
  {#each grid as row, i}
    {#each row as card, j}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <!-- svelte-ignore a11y-mouse-events-have-key-events -->
      <!--check if token is placed-->
      {#if token_array.includes(card.at(-1))}
        <div class="card">
          <span class="occupied_card">
            <img
              src="/images/cards/{card.slice(0, -1)}.svg"
              alt={card.slice(0, -1)}
            />
            <img
              class="token"
              src={card.at(-1) === "r"
                ? "/images/token_red.svg"
                : card.at(-1) === "g"
                  ? "/images/token_green.svg"
                  : "/images/token_blue.svg"}
              alt="token"
            />
          </span>
        </div>
      {:else}
        <div
          class="card"
          id="droptarget"
          on:mouseover={() => {
            if (sel_card === card && $current_turn === $username) {
              window.addEventListener("mouseup", (event) => {
                //this misfires sometimes even if the dragged card is not hovering properly but eh. need to sync somehow ...
                grid[i][j] = card + "r";
                $socket
                  .emitWithAck("end-turn", $room_name, $username, {
                    position: [i, j],
                    card: card,
                  })
                  .then(() => {
                    //card has been added to the grid
                    //dispatch("card_placed");
                    $is_placed = true;
                  })
                  .catch((err) => console.log(err));
              });
            }
          }}
        >
          <!--create these into dropzones if the card gets selected and use the drop and drop API, highlight free spaces as well-->
          <span>
            <img
              class={sel_card === card || (card === "f" && sel_card)
                ? "hover"
                : ""}
              src="/images/cards/{card}.svg"
              alt={card}
            />
          </span>
        </div>
      {/if}
    {/each}
  {/each}
</div>

<style>
  .occupied_card {
    max-width: 100%;
    max-height: 100%;
  }
  .occupied_card > img {
    position: absolute;
  }
  .token {
    border: 2px solid blue;
    margin-top: 25px;
    margin-left: 10px;
    width: 50px;
    height: 50px;
  }

  .wrapper {
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(10, 110px);
    grid-template-rows: repeat(10, 80px);
    justify-content: center;
    align-items: center;
  }

  .card {
    width: 150px;
    height: 100px;
    transition: 0.2s;
  }

  span {
    width: 150px;
    height: 100px;
  }
  span > img {
    transform: rotate(90deg);
    max-width: 100%;
    max-height: 100%;
    height: 100px;
    object-fit: scale-down;
    transition: 0.2s;
  }

  .hover {
    border: 5px solid green;
  }
</style>
