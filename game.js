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
  this.playersNotReady = 0;
  this.winner = null;
  this.gameStarted = false;
  this.gameOver = false;

  this.startGame = function () {
    this.gameStarted = true;
    shuffle(this.players);
    this.deck = new Deck();
    shuffle(this.deck.cards);

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

  // per game round
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

  // gets deck public data
  this.getDeckPublicData = function () {
    tableData = {
      deckCardCount: this.deck.cards.length,
      lastDiscardedCard: this.deck.discarded[this.deck.discarded.length - 1],
    };
    return tableData;
  };

  // deals all cards out and places them in property piles
  // user player should already be added
  this.testFrontEnd = function () {
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
      } else if (card.hasValue()) {
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
  cardTypes = ["prop", "propWC", "propAny", "cash", "rent", "power"];
  for (let t = 0; t < cardTypes.length; t++) {
    const cardType = cardTypes[t];
    const cardGroup = cards.CARDS[cardType];
    for (let i = 0; i < cardGroup.length; i++) {
      const cardEntry = cardGroup[i];
      for (let j = 0; j < cardEntry.numberof; j++) {
        var newCard = new Card(cardType, cardEntry, j);
        this.cards.push(newCard);
      }
    }
  }

  this.flipPile = function () {
    this.cards = this.discarded.reverse();
    this.discarded = [];
  };

  this.discard = function (card) {
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
  this.hasJustSayNo = false;
  this.position = position;

  // player turn:
  this.takeTurn = function () {
    this.movesRemaining = 3; //
    this.getMove(this.movesRemaining);
    while (true) {
      if (this.movesRemaining === 0) {
        break;
      }
    }
    this.checkHandTooBig();
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
      moneyTopCard: this.money[0],
      moneyCardCount: this.money.length,
      handCardCount: this.hand.length,
    };
  };

  // send all game data to client
  this.sendAllGameData = function (game) {
    // gets data from other players relative to this player position
    var OtherPlayerData = [];
    var relPos = positionRelative(game.players.length, this.position);
    for (let i = 1; i < relPos.length; i++) {
      // i=1 to not include player position
      p = relPos[i];
      OtherPlayerData.push(game.players[p].getPublicData());
    }

    // Collates and sends game data
    gameData = {
      privateData: this.getPrivateData(),
      publicData: OtherPlayerData,
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

  // requests move from client
  this.getMove = function (movesRemaining) {
    io.to(this.socketID).emit("move", movesRemaining);
  };

  // draws a card from deck into players hand
  this.giveHandCard = function (deck) {
    card = deck.cards.pop();
    this.hand.push(card);
    io.to(this.socketID).emit("pushHand", card);
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

// card image getter
function nameImage(card, cardNum) {
  var cardType = card.cardType;
  var colour = card.colour;

  if (cardType === "cash") {
    return "money-" + cardNum + ".png"
  } else if (cardType === "prop") {
    return "prop-" + colour + "-" + cardNum + ".png"
  } else if (cardType === "propWC") {
    var revColour = card.revColour;
    return "prop-wildcard-" + colour + "-" + revColour + ".png"
  } else if (cardType === "propAny") {
    return "prop-any.png"
  } else if (cardType === "rent") {
    // get colours????
    return "rent-" + colour1 + "-" + colour2 + ".png"
  } else if (cardType === "power") {

  } else { console.log(" BIG ERROR ") }
}

// Game start
// game = new Game(); - starting game inside socket for testing

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
    game.testFrontEnd();
    /*
    UNCOMMENT THIS:
    socket.emit("gameStatus", waiting );
    game.playersNotReady++;
    */
  });

  // Check if players are ready
  socket.on("ready", function () {
    game.playersNotReady--;
    if (game.players.length > 1 && game.playersNotReady === 0) {
      game.startGame();
    }
  });
});
