const cards = require(__dirname + "/cards.js");
const Deck = require(__dirname + "/deck.js")
const Player = require(__dirname + "/player.js")

/*
GAME HEIRARCHY = GAME > ROUND > TURN > MOVE
*/


module.exports = Game;

// Game prototype
Game = function () {
  this.players = [];
  this.gameStarted = false;
  this.streetCounter = 0;
  this.currentPlayer = 0;

  this.startGame = function () {
    this.players = shuffle(this.players);
    this.deck = new Deck();
    this.deck.cards = shuffle(this.deck.cards);

    const startCards = 5;
    this.cardsPerTurn = 2;
    this.maxHandCards = 7;

    for (let p = 0; p < players.length; p++) {
      // lets each player know position
      this.players[p].position = p;
      // Draws 5 (numberOfStartingCards) cards:
      this.players[p].drawCards(this.deck, startCards);
      this.players[p].sendAllGameData(this);
    }
    this.players[0].startTurn()
  };

  // start next player turn
  this.continue = function () {
    this.incrPlayer()
    this.players[this.currentPlayer].startTurn()
  }

  // adding a player:
  this.addPlayer = function (socket, name) {
    // TODO - add check for if same name exists.
    const position = this.players.length;
    if (!this.gameStarted && position < 6) {
      this.players.push(new Player(socket, name, position));
    }
  };

  //checks if all players are ready to start
  this.allPlayersReady = function () {
    for (let p = 0; p < this.players.length; p++) {
      if (this.players[p].isReady === false) {
        return false;
      }
    }
    return true;
  };

  this.getPlayerByCardID = function (id) {
    for (let p = 0; p < this.players.length; p++) {
      const player = this.players[p]
      for (let s = 0; s < player.property.length; s++) {
        for (let c = 0; c < player.property[s].length; c++) {
          if (player.property[s][c].id = id) {
            return player;
          }
        }
      }
    }
  }

  // gets deck public data
  this.getDeckPublicData = function () {
    var discardedCount = this.deck.discarded.length;
    var discardedTopCard = this.deck.discarded[this.deck.discarded.length - 1];
    if (this.deck.discarded === []) {
      discardedCount = 0;
    }
    tableData = {
      deckCardCount: this.deck.cards.length,
      discardedCount: discardedCount,
      discardedTopCard: discardedTopCard,
    };
    return tableData;
  };

  //returns player list and if they're ready
  this.getLobbyData = function () {
    var lobby = [];
    for (let p = 0; p < this.players.length; p++) {
      const player = this.player[p];
      lobby.push({ name: player.name, ready: player.isReady });
    }
    return lobby;
  };

  // gets game position of player from relative position to another player
  this.getPlayerByRelPos = function (player, position) {
    const sum = player.position + position;
    if (sum > this.players.length) {
      return sum - this.players.length;
    } else {
      return sum;
    }
  };

  // Gives repositioned/rotated array indexes, relative to given starting index
  this.positionRelative = function (arraylength, index) {
    const pRange = [...Array(arraylength).keys()];
    const relPos = pRange.slice(index).concat(pRange.slice(0, index));
    return relPos;
  };

  // increments player counter to decide whos turn it is
  this.incrPlayer = function () {
    if (this.currentPlayer < this.players.length) {
      this.currentPlayer++;
    } else {
      this.currentPlayer = 0;
    }
  }

  // kicks a player from server
  this.kickPlayer = function (socketID) {
    //TODO
  }
};
