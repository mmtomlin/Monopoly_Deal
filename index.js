const express = require("express");
const socketio = require("socket.io");

const Game = require(__dirname + "/game.js");
const shuffle = require(__dirname + "/shuffle.js");

/* deprecated - moving to player based game status, 
sendGameStatus = function (game) {
  console.log("emitting game status");
  io.emit("gameStatus", {
    gameStarted: game.gameStarted,
    players: game.getLobbyData(),
  });
};
*/

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
    game.sendLobbyData();
  });

  // Check if players are ready, if they are, start game
  socket.on("ready", function () {
    console.log("received ready message from " + socket.id);
    var player = game.getPlayerBySocket(socket.id);
    player.isReady = !player.isReady;
    if (game.players.length > 1 && game.allPlayersReady()) {
      game.startGame();
      game.updateAllClients();
    }
    game.sendLobbyData();
  });

  // if player plays cards during turn
  socket.on("move", function (data) {
    console.log(socket.id + " has sent " + data.id);
    console.log("with options: " + JSON.stringify(data.options, null, 2));
    let player = game.getPlayerBySocket(socket.id);
    if (player.movesRemaining > 0) {
      player.playHandCard(data.id, game, data.options);
    }
  });

  // if player moves property cards / money during turn
  socket.on("rearrange", function (data) {
    console.log(
      "received rearrange message of " + JSON.stringify(data, null, 2)
    );
    let player = game.getPlayerBySocket(socket.id);
    if (player.position === game.currentPlayer) {
      player.rearrange(game, data);
      game.updateAllClients();
      player.continueTurn(game);
    }
  });

  // accept power
  socket.on("accept", function (data) {
    console.log(
      "accept received from " + socket.id + ", with option " + data.option
    );
    let player = game.getPlayerBySocket(socket.id);
    let owedPlayer = game.players[game.currentPlayer];
    owedPlayer.waitResponse = false;
    if (data.option !== "accept" && player.hasJustSayNo()) {
      console.log("just say no played!");
      game.deck.discarded.push(player.popJustSayNo());
      owedPlayer.canPlayJustSayNo = true;
    } else {
      let a = owedPlayer.loadedPower;
      a.pwr(a.opts[0], a.opts[1], a.opts[2]);
      player.cleanStreets();
    }
    owedPlayer.finishMove(game);
  });

  // discard cards (if more than 7), data.id = discarded card id
  socket.on("discard", function (data) {
    console.log("discard received from " + socket.id);
    let player = game.getPlayerBySocket(socket.id);
    game.deck.discarded.push(player.popHandCardByID(data.id));
    player.finishTurn(game);
  });

  // data.id = money card id
  socket.on("pay", function (data) {
    console.log(socket.id + " paying with " + data.id);
    let player = game.getPlayerBySocket(socket.id);
    let owedPlayer = game.players[game.currentPlayer];
    if (typeof(data.justSayNo) !== "undefined") {
      game.deck.discarded.push(player.popJustSayNo());
      console.log("just say no played!");
      player.moneyOwes = 0;
    } else {
      let card = player.popCardByID(data.id);
      console.log("player owes " + player.moneyOwes);
      console.log("card value: " + card.card.value);
      player.moneyOwes -= card.card.value;
      owedPlayer.takeCard(card, game);
      player.cleanStreets();
      if (player.moneyOwes < 1) player.moneyOwes = 0;
    }
    if (game.allDebtsPaid()) {
      owedPlayer.finishMove(game);
    }
  });

  socket.on("endTurn", function () {
    console.log("end turn receieved from " + socket.id);
    let player = game.getPlayerBySocket(socket.id);
    player.movesRemaining = 0;
    player.finishTurn(game);
  });
});
