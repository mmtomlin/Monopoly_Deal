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
  };

  // adding a player:
  this.addPlayer = function (id, name) {
    const position = this.players.length;
    if (!this.gameStarted && position < 6) {
      this.players.push(new Player(id, name, position));
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

  // returns player object from socket id
  this.getPlayerByID = function (id) {
    for (let p = 0; p < this.players.length; p++) {
      if (this.players[p].socketID === id) {
        return this.players[p];
      }
    }
  };

  this.getPlayerByCardID = function (id) {
    //TODO
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

  //
  this.getPlayerByRelPos (player, position) {
    //TODO
  }

  // Gives repositioned/rotated array indexes, relative to given starting index
  this.positionRelative = function (arraylength, index) {
    const pRange = [...Array(arraylength).keys()];
    const relPos = pRange.slice(index).concat(pRange.slice(0, index));
    return relPos;
  };
};
