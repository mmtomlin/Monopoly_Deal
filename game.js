const express = require("express");
const socketio = require("socket.io");
const fs = require("fs");

const cards = require("./cards.js");

/*
GAME HEIRARCHY = GAME > ROUND > TURN > MOVE
*/

//
// GAME LOGIC
//

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
};

// Deck prototype
function Deck() {
  this.cards = [];
  this.discarded = [];

  // Generate cards:
  cardTypes = [
    "prop",
    "propWC",
    "propAny",
    "cash",
    "rent",
    "rentAny",
    "power",
    "building",
  ];

  //loop over card types
  for (let t = 0; t < cardTypes.length; t++) {
    const cardType = cardTypes[t];
    const cardGroup = cards.CARDS[cardType];
    // loop over cards
    for (let i = 0; i < cardGroup.length; i++) {
      const cardEntry = cardGroup[i];
      // loops if more than one of this same card
      for (let j = 0; j < cardEntry.numberof; j++) {
        var newCard = new Card(cardType, cardEntry, j);
        var name = cardEntry.name;
        var id = name + j;
        if (cardType === "prop") {
          name = name.concat(j + 1);
        }
        newCard.name = name;
        newCard.id = id;
        this.cards.push(newCard);
      }
    }
  }

  this.flipPile = function () {
    this.cards = this.discarded.reverse();
    this.discarded = [];
  };

  this.addToDiscard = function (card) {
    this.discarded.push(card);
  };
}

// Player prototype
function Player(id, name, position) {
  this.name = name;
  this.socketID = id;
  this.hand = [];
  this.property = [];
  this.money = [];
  this.isReady = false;
  this.hasJustSayNo = false;
  this.position = position;

  // player turn:
  this.startTurn = function () {
    this.movesRemaining = 3; //
    io.to(this.socketID).emit("move", {movesRemaining: this.movesRemaining});
  };

  // get private data for this player
  this.getPrivateData = function () {
    return {
      name: this.name,
      property: this.property,
      money: this.money,
      hand: this.hand,
    };
  };

  // get public data for this player
  this.getPublicData = function () {
    return {
      name: this.name,
      property: this.property,
      // number of hand cards counted as "money" to make things easier
      money: {
        moneyTopCard: this.money[0],
        moneyCardCount: this.money.length,
        handCardCount: this.hand.length,
      },
    };
  };

  // send all game data to client
  this.sendAllGameData = function (game) {
    // gets data from other players relative to this player position
    var playerData = [];
    // inserts user player at position[0]
    playerData.push(this.getPrivateData());
    var relPos = positionRelative(game.players.length, this.position);
    for (let i = 1; i < relPos.length; i++) {
      // i=1 to not include user player
      p = relPos[i];
      playerData.push(game.players[p].getPublicData());
    }

    // Collates and sends game data
    gameData = {
      playerData: playerData,
      tableData: game.getDeckPublicData(),
    };

    io.to(this.socketID).emit("gameData", gameData);
    fs.writeFile(
      "test_game_data.json",
      JSON.stringify(gameData, null, 2),
      function () {
        console.log("JSON game data file written");
      }
    );
  };

  // draws a card from deck into players hand
  this.giveHandCard = function (deck) {
    card = deck.cards.pop();
    this.hand.push(card);
    io.to(this.socketID).emit("pushHand", card);
  };

  this.playHandCard = function (id) {
    for (let c = 0; c < this.cards.length; c++) {
      // check if card exists
      if (this.cards[c].id === id) {

      }
      // need to get list of methods for each card,
      // then ask player for choice if more than one
      // if rent-any or power card, need to ask player to choose
      // also if stealing, need to ask player to choose
      // if asking for player/cards off table, this needs to be interactive

      // need to write functions for all player actions!

    }
  };

  // checks if hand has more cards than allowed
  this.checkHandTooBig = function (game) {
    const excessCards = this.hand.cards.length - game.maxHandCards;
    if (excessCards > 0) {
      io.to(this.socketID).emit("forceDiscard", excessCards);
    }
  };

  this.addCardToProp = function (card) {
    colour = card.card.colour;
    var colourPresent = false;
    for (let i = 0; i < this.property.length; i++) {
      if (colour === this.property[i].colour) {
        colourPresent = true;
        this.property[i].cards.push(card);
        break;
      }
    }
    if (!colourPresent) {
      this.property.push(new Street(card));
    }
  };
}

// Street prototype
function Street(card) {
  this.cards = [card];
  this.colour = card.card.colour;

  // Rent amounts:
  const RENTS = {
    brown: [1, 2],
    dblue: [3, 8],
    green: [2, 4, 7],
    lblue: [1, 2, 3],
    orange: [1, 3, 5],
    purple: [1, 2, 4],
    rail: [1, 2, 3, 4],
    red: [2, 3, 6],
    utility: [1, 2],
    yellow: [2, 4, 6],
  };

  this.isComplete = function () {
    if (this.cards.length >= RENTS[this.colour].length) {
      return true;
    } else {
      return false;
    }
  };

  this.getRent = function () {
    if (RENTS[this.colour].length < this.cards.length) {
      return RENTS[this.colour][this.cards.length];
    } else {
      return RENTS[this.colour][this.colour.length - 1];
    }
  };
}

// Card prototype
function Card(cardType, creatorObject, id) {
  this.card = creatorObject;
  this.card.id = id;
  this.cardType = cardType;

  // function to change colour or wildcards
  this.flip = function () {
    if (this.reverse !== null) {
      var l = this.reverse;
      this.reverse = this.colour;
      this.colour = l;
    }
  };

  this.isprop = function () {
    if (
      this.cardType === "prop" ||
      this.cardType === "propWC" ||
      this.cardType === "propAny"
    ) {
      return true;
    } else {
      return false;
    }
  };

  this.isrent = function () {
    if (this.cardType === "rent") {
      return true;
    } else {
      return false;
    }
  };

  this.hasValue = function () {
    if (typeof this.card.value === "number") {
      return true;
    } else {
      return false;
    }
  };

  this.play = function (player) {};
}

// Gives repositioned/rotated array indexes, relative to given starting index
function positionRelative(arraylength, index) {
  const pRange = [...Array(arraylength).keys()];
  const relPos = pRange.slice(index).concat(pRange.slice(0, index));
  return relPos;
}

// Fisher-Yates Shuffle agorithm
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

// Game start
game = new Game();

//
// SERVER SETUP
//

// App setup
var app = express();
app.use(express.static(__dirname + "/public/"));
var server = app.listen(4000, function () {
  console.log("listening to requests on port 4000");
});

// Serve main page
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// Socket setup
var io = socketio(server);
io.on("connection", function (socket) {
  console.log("made socket connection", socket.id);

  // Initialise player, send waiting status
  socket.on("name", function (data) {
    game = new Game();
    game.addPlayer(socket.id, data.name);
    console.log("Added player: " + data.name);
  });

  // Check if players are ready, if they are, start game
  socket.on("ready", function () {
    var player = game.getPlayerByID(socket.id);
    player.isReady = true;
    if (game.players.length > 1 && game.allPlayersReady()) {
      game.gameStarted = true;
      game.startGame();
    }
    io.emit("gameStatus", {
      gameStarted: game.gameStarted,
      players: game.getLobbyData(),
    });
  });

  socket.on("move", function (data) {
    var player = game.getPlayerByID(socket.id);
    player.playHandCard(data.id);
  })
});
