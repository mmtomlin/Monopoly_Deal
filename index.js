const express = require("express");
const socketio = require("socket.io");

const Game = require(__dirname + "/game.js")
const shuffle = require(__dirname + "/shuffle.js")


// Game start
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
  socket.on("name", function (name) {
    game.addPlayer(socket, name);
    console.log("Added player: " + name);
  });

  // Check if players are ready, if they are, start game
  socket.on("ready", function () {
    var player = game.getPlayerByID(socket.id);
    player.isReady = true;
    if (game.players.length > 1 && game.allPlayersReady()) {
      game.startGame();
    }
    io.emit("gameStatus", {
      gameStarted: game.gameStarted,
      players: game.getLobbyData(),
    });
  });

  // if player plays cards during turn
  socket.on("move", function (data) {
    let player = game.getPlayerByID(socket.id);
    if (player.movesRemaining > 0) {
      player.playHandCard(data.id, game, data.options);
    }
  });

  // if player moves property cards / money during turn
  socket.on("rearrangeProp", function (data) {
    //TODO
  });
  socket.on("rearrangeMoney", function (data) {
    //TODO
  })

  // accept power 
  socket.on("accept", function (data) {
    let player = game.getPlayerByID(socket.id);
    let owedPlayer = game.players[game.currentPlayer];
    if (data === "playJustSayNo" && player.hasJustSayNo) {
      game.discarded.push(player.popJustSayNo());
    } else {
      let resp = owedPlayer.waitResponse.power;
      resp.power(resp.opts.game,resp.opts.player,resp.)
    }
  });

  // discard cards (if more than 7), data.id = discarded card id
  socket.on("discard", function (data) {
    let player = game.getPlayerByID(socket.id)
  });

  // data.id = money card id
  socket.on("pay", function (data) {
    let player = game.getPlayerByID(socket.id);
    let owedPlayer = game.players[game.currentPlayer];
    let card = player.popCardById(data.id);
    player.moneyOwes -= card.card.value;
    owedPlayer.takeCard(card);
    if (player.moneyOwes > 0) {
      socket.emit("payRequest", player.moneyOwes);
    }
    if (game.allDebtsPaid) {
      owedPlayer.finishMove();
    }
  })
});
