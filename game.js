const express = require("express");
const socketio = require("socketio");

const cards = require("./cards.js");

//
// GAME LOGIC
//

// Game prototype
module.exports = function (Game) {
  this.startGame = function () {
    this.deck = new Deck();
    this.deck.shuffle();
    this.gameStarted = false;
    this.gameOver = false;

    const players = ["jeff", "steve"];
    const numberOfStartingCards = 5;
    const cardsPerTurn = 2;

    // Init players
    this.players = [];
    for (let p = 0; p < players.length; p++) {
      this.players.push(new Player(players[p]));
    }

    // TODO need to pick random start
    // draw 5 cards each:
    for (let p = 0; p < players.length; p++) {
      for (let i = 0; i < numberOfStartingCards; i++) {
        this.players[p].hand.push(this.deck.drawCard());
      }
    }

    // operations per round
    this.doRound = function () {
      // Iterate over players
      for (let p = 0; p < players.length; p++) {
        // draw cards:
        for (let i = 0; i < cardsPerTurn; i++) {
          this.players[p].hand.push(this.deck.drawCard());
        }
        // play cards:
        this.players[p].rentMultiplier = 1;
        var cardsRemaining = cardsPerTurn;
        while (cardsRemaining > 0) {
          move = this.players[p].getMove();
          if (typeof move.play === "number") {
            this.players[s].hand[move.play].play(this.players[p]);
          }
        }
      }
    };

    // main game loop
    while (!this.gameOver) {
      this.doRound();
    }
  };
};

// Player prototype
function Player(name, position) {
  this.name = name;
  this.position = position;
  this.hand = [];
  this.property = [];
  this.money = [];

  this.getMoves = function () {
    //
    movelist = [];
    for (let i = 0; i < this.hand.length; i++) {
      const card = this.hand[i];
      if (card.ispower) {
        movelist.push({ card: card, move: "power" });
      }
      movelist.push({ card: card, move: "place" });
    }
    return movelist;
  };
}

// Deck prototype
function Deck() {
  this.cards = [];
  this.discarded = [];

  // Generate property cards:
  cardTypes = ["prop", "propWC", "propAny", "cash", "rent", "power"];
  for (let t = 0; t < cardTypes.length; t++) {
    const cardType = cardTypes[t];
    const cardGroup = cards.CARDS[cardType];
    for (let i = 0; i < cardGroup.length; i++) {
      const cardEntry = cardGroup[i];
      for (let j = 0; j < cardEntry.numberof; j++) {
        this.cards.push(new Card(cardType, cardEntry, j));
      }
    }
  }

  this.shuffle = function () {
    shuffle(this.cards);
  };

  this.drawCard = function () {
    return this.cards.pop();
  };

  this.flipPile = function () {
    this.cards = this.discarded.reverse();
    this.discarded = [];
  };

  this.discard = function (card) {
    this.discarded.push(card);
  };
}

// Dealbreaker power:
function place(card, player) {}

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

// Card prototype
function Card(type, creatorObject, id) {
  this.card = creatorObject;
  this.card.id = id;
  this.card.type = type;

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
      this.cardType === "Prop" ||
      this.cardType === "PropWC" ||
      this.cardType === "PropAny"
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

  this.play = function (player) {};
}

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

//
// SERVER SETUP
//

// App setup
var app = express();
app.use(express.static("public"));
var server = app.listen(4000, function () {
  console.log("listening to requests on port 4000");
});

// Serve main page
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});
