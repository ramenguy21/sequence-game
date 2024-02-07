import { standard_deck } from "./constants";
//Sequence Game Class responsible for providing a base template to mutate game state and stuff
class Game {
  draw_pile = standard_deck;
  players: { name: string; hand: string[]; token: string }[] = [];
  //variable responsible for managing turns, ensure that when mutating, it wraps around the players array properly
  current_turn_idx = 0;

  //static board to match the card, if there is a match, place either (r, g, b) at the start of the string in that position
  board = [
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

  //list of possible colors of tokens
  token_list = ["r", "g", "b"];

  //when game is intitalized
  constructor(players_list: string[]) {
    if (!players_list) {
      throw new Error("[Game] : Error initializing game");
    }

    if (players_list.length > 3) {
      console.error(
        "[ERROR]: attempt to create a game with more than 3 players, please do not :)"
      );
      return;
    }

    //----Shuffling algorithm----
    let curr_idx = this.draw_pile.length,
      rand_idx;

    // While there remain elements to shuffle.
    while (curr_idx > 0) {
      // Pick a remaining element.
      rand_idx = Math.floor(Math.random() * curr_idx);
      curr_idx--;

      // And swap it with the current element.
      [this.draw_pile[curr_idx], this.draw_pile[rand_idx]] = [
        this.draw_pile[rand_idx],
        this.draw_pile[curr_idx],
      ];
    }
    //----Shuffling algorithm----

    //divide the cards amongst the players and choose their token color
    //Player is an array of objects ranging from 2-3 elements.
    //If two - 7 cards each
    //If three - 6 cards each

    players_list.map((pl) => {
      let rand_token_idx = Math.floor(Math.random() * this.token_list.length);
      this.players.push({
        name: pl,
        hand: this.draw_pile.splice(0, 7), //players_list.length === 2 ? 7 : 6
        token: this.token_list.splice(rand_token_idx, 1).at(0) || "",
      });
    });

    //give the turn to whoever ended up in the first place
    this.current_turn_idx = 0;
  }

  //this is called after the socket has declared end of turn.
  //position is meant to be a two element array [y_pos : int, x_pos : int]
  //player is the name of the player who made the move
  //returns the player who goes next.
  handle_turn(player: string, card: string, position: number[]) {
    //select the element
    const current_move = this.board[position[0]][position[1]];

    //select the player
    const player_idx = this.players.findIndex((pl) => pl.name === player);

    //check if the move is valid

    //handle edge case for jokers

    //handle edge case for free space
    if (
      (position[0] === 0 && position[1] === 0) ||
      (position[0] === 0 && position[1] === 9) ||
      (position[0] === 9 && position[1] === 0) ||
      (position[0] === 9 && position[1] === 9)
    ) {
      this.board[position[0]][position[1]] =
        current_move + this.players[player_idx].token;
    }

    //card matches (also checks if no token is placed)
    if (card !== current_move) {
      console.log("Invalid attempt to place a card", card, current_move);
      return this.players[this.current_turn_idx].name;
    }

    //mutate the string to have either r, g, b at the start marking it as occupied.
    this.board[position[0]][position[1]] =
      current_move + this.players[player_idx].token;

    //remove the card from hand
    const card_idx = this.players[this.current_turn_idx].hand.indexOf(card);

    if (card_idx === -1) {
      console.error("Invalid attempt to place a card, no match found in hand");
      return this.players[this.current_turn_idx].name;
    }
    //and while there are cards in the draw pile, add it to the player's hand
    if (this.draw_pile.length) {
      this.players[this.current_turn_idx].hand[card_idx] =
        this.draw_pile.pop()!;
    } else {
      //else just remove it
      this.players[this.current_turn_idx].hand.splice(card_idx, 1);
    }

    //log
    console.info("[MOVE] : " + card + " to " + position);

    //return who goes next
    return this.next_turn();
  }

  //Function to iterate through the array after end of each turn and see if there's a sequence match
  //open challenge to come up with an efficent lookup
  check_win_condition() {
    //TODO:
  }

  //mutate current_turn variable here; ensure a wrap around
  next_turn() {
    this.current_turn_idx = (this.current_turn_idx + 1) % this.players.length;
    return this.players[this.current_turn_idx].name;
  }

  get_player_details_by_index(index: number) {
    return this.players[index];
  }

  get_player_details_by_name(name: string) {
    return this.players.find((el) => el.name === name);
  }
}

export default Game;
