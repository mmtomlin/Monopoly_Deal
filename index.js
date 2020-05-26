const express = require("express");
const socketio = require("socket.io");

const Game = require(__dirname + "/game.js");
const shuffle = require(__dirname + "/shuffle.js");

sendGameStatus = function (game) {
  console.log("emitting game status");
  io.emit("gameStatus", {
    gameStarted: game.gameStarted,
    players: game.getLobbyData(),
  });
};

// Game start
console.log("starting new game");
console.log(new Date());
game = new Game();

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

// Sockets
var io = socketio(server);
io.on("connection", function (socket) {
  console.log("made socket connection", socket.id);

  // Initialise player, send waiting status
  socket.on("name", function (data) {
    game.addPlayer(socket, data.name);
    console.log("Added player: " + data.name);
    sendGameStatus(game);
  });

  // Check if players are ready, if they are, start game
  socket.on("ready", function () {
    console.log("received ready message from " + socket.id);
    var player = game.getPlayerBySocket(socket.id);
    player.isReady = true;
    if (game.players.length > 1 && game.allPlayersReady()) {
      game.startGame();
      game.updateAllClients();
    }
    sendGameStatus(game);
  });

  // if player plays cards during turn
  socket.on("move", function (data) {
    if (typeof(data.id) === "undefined") console.log(JSON.stringify(data, null, 2));
    console.log(socket.id + " has sent " + data.id);
    console.log("with options: " + JSON.stringify(data.options, null, 2));
    let player = game.getPlayerBySocket(socket.id);
    if (player.movesRemaining > 0) {
      console.log("moves remaining: " + player.movesRemaining)
      player.playHandCard(data.id, game, data.options);
    }
  });

  // if player moves property cards / money during turn
  socket.on("rearrangeProp", function (data) {
    //TODO
  });
  socket.on("rearrangeMoney", function (data) {
    //TODO
  });

  // accept power
  socket.on("accept", function (data) {
    console.log("accept received from " + socket.id);
    let player = game.getPlayerBySocket(socket.id);
    let owedPlayer = game.players[game.currentPlayer];
    owedPlayer.waitResponse = false;
    if (data === "playJustSayNo" && player.hasJustSayNo) {
      game.discarded.push(player.popJustSayNo());
    } else {
      let a = owedPlayer.loadedPower;
      a.pwr(a.opts[0], a.opts[1], a.opts[2]);
    }
    owedPlayer.finishMove(game);
  });

  // discard cards (if more than 7), data.id = discarded card id
  socket.on("discard", function (data) {
    console.log("discard received from " + socket.id);
    let player = game.getPlayerBySocket(socket.id);
    game.deck.discarded.push(player.popHandCardByID(data.id));
    player.finishMove(game);
  });

  // data.id = money card id
  socket.on("pay", function (data) {
    console.log(socket.id + " paying with " + data.id);
    let player = game.getPlayerBySocket(socket.id);
    let owedPlayer = game.players[game.currentPlayer];
    let card = player.popCardByID(data.id);
    player.moneyOwes -= card.card.value;
    owedPlayer.takeCard(card, game);
    if (player.moneyOwes > 0) {
      socket.emit("payRequest", { amount: player.moneyOwes });
    }
    if (game.allDebtsPaid()) {
      owedPlayer.finishMove(game);
    }
  });

  socket.on("endTurn", function() {
    let player = game.getPlayerBySocket(socket.id);
    player.movesRemaining = 0;
    player.finishTurn(game);
  })
});
