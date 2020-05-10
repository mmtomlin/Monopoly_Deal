// connect to socket
var socket = io.connect("http://localhost:4000");

// Query DOM
var loginBtn = document.querySelector("#login-button")
var loginNameInput = document.querySelector("#login-name")
// Emit events
loginBtn.addEventListener("click", function () {
  socket.emit("name", loginNameInput.value);
});

// game started message from server
socket.on("gameStatus", function () {
})

// game data message
socket.on("gameData", function () {
})

// move request
socket.on("move", function () {
})

// drawn card data
socket.on("pushHand", function () {
})

// request to discard cards if too many in hand
socket.on("forceDiscard", function () {
})

// request to accept steal from another player (or play JSN)
socket.on("steal", function() {
})

// request to pay another player
socket.on("giveCash", function() {
})
