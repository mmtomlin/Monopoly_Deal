const express = require("express");
const socketio = require("socketio");

const cards = require("./cards.js");

// GAME HEIRARCHY = GAME > ROUND > TURN > MOVE

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
      this.players[p].sendAllGameData();
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
    if (!this.gameStarted) {
      this.players.push(new Player(id, name));
    }
  };

  this.getTableData = function () {
    tableData = {
      deckCardCount: this.deck.cards.length(),
      lastDiscardedCard: this.deck.discarded[this.deck.discarded.length - 1],
    };
  };

  // deals all cards out and places them in property piles
  // 
  this.testFrontEnd = function () {
    this.deck = new Deck();
    shuffle(this.deck);
    players = ["bob","steve","derek","paul"];
    for (let p = 0; p < players.length; p++) {
      this.addPlayer(null, players[p]) 
    }
    for (let i = 0; i < this.deck.cards.length; i++) {
      var card = this.deck.cards.pop()
      if (card.isprop()) {
        this.players[Math.floor(Math.random * 5)]
      }     
    }
    this.players[0].sendAllGameData();
  }
};

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

  this.flipPile = function () {
    this.cards = this.discarded.reverse();
    this.discarded = [];
  };

  this.discard = function (card) {
    this.discarded.push(card);
  };
}

// Player prototype
function Player(id, name) {
  this.name = name;
  this.socketID = id;
  this.hand = [];
  this.property = [];
  this.money = [];
  this.hasJustSayNo = false;

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

  // get public data for all other players
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
    // Creates array of positions relative to this player
    const pRange = [...Array(game.players.length).keys()];
    const relPos = pRange
      .slice(player.position)
      .concat(pRange.slice(0, player.position));
    var playerData = [];

    // gets data from other players relative to this player position
    for (let i = 0; i < game.players.length - 1; i++) {
      p = relPos[i];
      playerData.push(game.players[p].getPublicData());
    }

    // Collates and sends game data
    gameData = {
      privateData: this.getPrivateData(),
      publicData: this.getPublicData(),
      tableData: game.getTableData(),
    };
    io.to(this.socketID).emit({ gameData: gameData });
  };

  // requests move from client
  this.getMove = function (movesRemaining) {
    io.to(this.socketID).emit({ move: movesRemaining });
  };

  // draws a card from deck into players hand
  this.giveHandCard = function (deck) {
    card = deck.cards.pop();
    this.hand.push(card);
    io.to(this.socketID).emit({ pushHand: card });
  };

  // checks if hand has more cards than allowed
  this.checkHandTooBig = function (game) {
    const excessCards = this.hand.cards.length - game.maxHandCards;
    if (excessCards > 0) {
      io.to(this.socketID).emit({ forceDiscard: excessCards });
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
    if (this.cards.length >= RENTS[this.colour].length) { return true } else { return false }
  };

  this.getRent() = function () {
    if (RENTS[this.colour].length < this.cards.length) {
      return RENTS[this.colour][this.cards.length];
    } else {
      return RENTS[this.colour][this.colour.length -1]
    };
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

  this.play = function (player) {};
}

// Game start
game = Game();

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

// Socket setup
var io = socket(server);
io.on("connection", function (socket) {
  console.log("made socket connection", socket.id);

  // Initialise player, send waiting status
  socket.on("name", function (data) {
    game.addPlayer(socket.id, data);
    console.log("Added player: " + data);
    socket.emit({ gameStatus: waiting });
    game.playersNotReady++;
  });

  // Check if players are ready
  socket.on("ready", function () {
    game.playersNotReady--;
    if (game.players.length > 1 && game.playersNotReady === 0) {
      game.startGame();
    }
  });
});
