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

  this.startGame = function () {
    this.players = shuffle(this.players);
    this.deck = new Deck();
    this.deck.cards = shuffle(this.deck.cards);

    const numberOfStartingCards = 5;
    const cardsPerTurn = 2;
    this.maxHandCards = 7;

    for (let p = 0; p < players.length; p++) {
      // lets each player know position
      this.players[p].position = p;
      // Draws 5 (numberOfStartingCards) cards:
      for (let i = 0; i < numberOfStartingCards; i++) {
        this.players[p].drawCard(this.deck);
      }
      this.players[p].sendAllGameData(this);
    }

    // main game-loop
    while (!this.gameOver) {
      this.doRound();
    }

    console.log(winner + " wins!");
  };

  // looping over players (per round operations)
  this.doRound = function () {
    // Iterate over players
    for (let p = 0; p < players.length; p++) {
      players[p].takeTurn();
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

  // deals all cards out and places them in property piles
  // user player should already be added
  this.testFrontEnd = function () {
    var handCards = 0;
    console.log("starting front end test");
    this.deck = new Deck();
    shuffle(this.deck);
    dummyPlayers = ["bob", "steve", "derek", "paul"];
    // add dummy players:
    for (let p = 0; p < dummyPlayers.length; p++) {
      this.addPlayer(null, dummyPlayers[p]);
    }
    // loop over deck
    for (let i = this.deck.cards.length; i > 0; i--) {
      var card = this.deck.cards.pop();
      if (card.isprop()) {
        this.players[Math.floor(Math.random() * 5)].addCardToProp(card);
      } else if (handCards < 7) {
        this.players[Math.floor(Math.random() * 5)].hand.push(card);
        handCards++;
      } else {
        this.players[Math.floor(Math.random() * 5)].money.push(card);
      }
    }
    console.log("sending game data to client");
    this.players[0].sendAllGameData(this);
  };

  // Gives repositioned/rotated array indexes, relative to given starting index
  this.positionRelative = function (arraylength, index) {
    const pRange = [...Array(arraylength).keys()];
    const relPos = pRange.slice(index).concat(pRange.slice(0, index));
    return relPos;
  };
};
