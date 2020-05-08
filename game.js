function Game() {
  this.startGame = function () {
    this.deck = new Deck();
    this.deck.shuffle();
    this.players = [];
  };
}

function Deck() {
  this.cards = [];
  this.discarded = [];

  k = 0;
  for (let i = 0; i < colours.length; i++) {
    let rev = null;
    for (let j = 0; j < colours[i].numberof; j++) {
      if (typeof colours[i].reverseColour === "string") {
        rev = colours[i].reverseColour;
      } else {
        rev = null;
      }

      this.cards[k] = new PropCard(
        colours[i].colour,
        j,
        colours[i].value,
        true,
        rev
      );
      k++;
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

function PropCard(colour, id, value, isprop, reverse, power = null) {
  this.colour = colour;
  this.value = value;
  this.id = id;
  if (reverse === null) {
    this.name = "prop-" + colour + "-" + (id + 1).toString();
  } else {
    this.name = "prop-wildcard-" + colour + "-" + reverse;
  }
  this.reverse = reverse;

  this.flip = function () {
    if (this.reverse !== null) {
      var l = this.reverse;
      this.reverse = this.colour;
      this.colour = l;
    }
  };
}

const colours = [
  // Main property cards
  {
    colour: "brown",
    numberof: 2,
    value: 1,
  },
  {
    colour: "dblue",
    numberof: 2,
    value: 4,
  },
  {
    colour: "green",
    numberof: 3,
    value: 4,
  },
  {
    colour: "lblue",
    numberof: 3,
    value: 1,
  },
  {
    colour: "orange",
    numberof: 3,
    value: 2,
  },
  {
    colour: "purple",
    numberof: 3,
    value: 2,
  },
  {
    colour: "rail",
    numberof: 4,
    value: 2,
  },
  {
    colour: "red",
    numberof: 3,
    value: 3,
  },
  {
    colour: "utility",
    numberof: 2,
    value: 2,
  },
  {
    colour: "yellow",
    numberof: 3,
    value: 3,
  },
  // Wildcards
  {
    colour: "dblue",
    numberof: 1,
    value: 4,
    reverseColour: "green",
  },
  {
    colour: "lblue",
    numberof: 1,
    value: 1,
    reverseColour: "brown",
  },
  {
    colour: "orange",
    numberof: 1,
    value: 2,
    reverseColour: "purple",
  },
  {
    colour: "green",
    numerof: 1,
    value: 4,
    reverseColour: "rail",
  },
  {
    colour: "lblue",
    numberof: 1,
    value: 4,
    reverseColour: "rail",
  },
  {
    colour: "utility",
    numberof: 1,
    value: 4,
    reverseColour: "rail",
  },
  {
    colour: "yellow",
    numberof: 1,
    value: 3,
    reverseColour: "red",
  },
  // Multi wildcard
  {
    colour: "any",
    numberof: 2,
    value: 0,
    
  }
];

const rent = {
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

var game = new Game();
game.startGame();
