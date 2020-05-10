const express = require("express");
const socketio = require("socketio");

const cards = require("./cards.js");

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
    shuffle(this.deck);

    const numberOfStartingCards = 5;
    const cardsPerTurn = 2;

    for (let p = 0; p < players.length; p++) {
      // lets each player know position
      this.players[p].position = p;
      // Draws 5 (numberOfStartingCards) cards:
      for (let i = 0; i < numberOfStartingCards; i++) {
        this.players[p].giveHandCard(this.deck.drawCard())
      }
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
        players[p].takeTurn()
      }
  };

  // adding a player:
  this.addPlayer = function (id, name) {
    if (!this.gameStarted) {
      this.players.push(new Player(id, name));
    } 
  };
};

// Player prototype
function Player(id, name) {
  this.name = name;
  this.socketID = id;
  this.hand = [];
  this.property = [];
  this.money = [];
  this.hasJustSayNo = false;

  // gets list of possible moves during turn:
  // DEPRECATED??????
  this.getMoves = function () {
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

  // take turn:
  this.takeTurn = function () {
    var cardsLeft = 3; //
    while (cardsLeft > 0) {
      this.getMove(cardsLeft)
    }
  }

  // get private data for this player
  this.getPrivateData = function () {
    return {
      name: this.name,
      property: this.property,
      money: this.money, 
      hand: this.hand,
    }
  }

  // get public data for this player
  this.getPublicData = function () {
    return {
      name: this.name,
      property: this.property,
      moneyTopCard: this.money[0], 
      moneyCardCount: this.money.length, 
      handCardCount: this.hand.length,
    }
  }

  // send all game data to client
  this.sendGameData = function(game) { 

    // Creates array of positions relative to this player
    const pRange = [...Array(game.players.length).keys()]
    const relPos = pRange.slice(player.position).concat(pRange.slice(0,player.position))
    var playerData = [];

    for (let i = 0; i < game.players.length - 1; i++) {
      p = relPos[i];
      playerData.push(game.players[p].getPublicData());
    }
    
    gameData = {  }

    io.to(this.socketID).emit({ gameData : gameData })

  }

  // requests move from client
  this.getMove = function (cardsLeft) {
    io.to(this.socketID).emit({ move: [true, cards]})
  }

  // passes cards into players hand
  this.giveHandCard = function (card) {
    this.hand.push(card);
    io.to(this.socketID).emit({ pushHand: card });
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

  this.addCard = function (addedCard) {
    this.cards.push(addedCard);
  };

  this.isComplete = function () {
    // TODO
  };

  this.getRent() = function () {
    // TODO
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
