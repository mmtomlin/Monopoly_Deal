// Game 'class'
function Game() {
  this.startGame = function () {
    this.deck = new Deck();
    this.deck.shuffle();
    this.players = [];
  };
}

// Deck 'class'
function Deck() {
  this.cards = [];
  this.discarded = [];

  // Generate property cards:

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

// Card 'class'
function Card(cardType, colour, id, value, power, reverse, image) {
  this.cardType = cardType;
  this.colour = colour;
  this.id = id;
  this.value = value;
  this.power = power;
  this.reverse = reverse;
  this.image = image;

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
