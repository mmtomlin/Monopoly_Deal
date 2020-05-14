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


// Socket setup
var io = socketio(server);
io.on("connection", function (socket) {
  console.log("made socket connection", socket.id);

  // Initialise player, send waiting status
  socket.on("name", function (data) {
    game.addPlayer(socket.id, data.name);
    console.log("Added player: " + data.name);
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

  socket.on("move", function (data) {
    var player = game.getPlayerByID(socket.id);
    if (player.movesRemaining > 0) {
      player.playHandCard(data.id, game, data.options);
    }
  });
});
