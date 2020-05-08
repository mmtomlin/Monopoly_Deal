const cards = require("./cards.js");

// Game prototype
function Game() {
  this.startGame = function () {
    this.deck = new Deck();
    this.deck.shuffle();
    this.gameStarted = false;
    this.gameOver = false;
    
    const players = ["jeff","steve"];
    const numberOfStartingCards = 5;
    const cardsPerTurn = 2;

    // TODO need to pick random start
    // draw 5 cards each:
    for (let p = 0; p < players.length; p++) {
      for (let i = 0; i < numberOfStartingCards; i++) {
        this.players[p].hand.push(this.Deck.drawCard())        
      }
    }

    // main game loop
    while (!this.gameOver) {
      doRound();
    }

    // operations per round
    doRound = function () {
      for (let p = 0; p < players.length; p++) {
        // draw cards:
        for (let i = 0; i < cardsPerTurn; i++) {
          this.players[p].hand.push(this.Deck.drawCard()) 
        }
        // play cards:
        this.player[p].rentMultiplier = 1
        this.players[p].cardsRemaining = cardsPerTurn;
        while (this.players[p].cardsRemaining > 0) {
          this.players[p].getmove()
        }
      }
    }
  }
};

// Player prototype
function Player(name, position) {
  this.name = name
  this.position = position
  this.hand = []
  this.property = []
  this.money = []
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
    console.log(cardGroup)
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
    return this.deck.cards.pop()
  }

  this.flipPile = function () {
    this.cards = this.discarded.reverse();
    this.discarded = [];
  };

  this.discard = function (card) {
    this.discarded.push(card);
  };
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

// Init game:
var game = new Game();
game.startGame();

}