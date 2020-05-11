// connect to socket
var socket = io.connect("http://localhost:4000");

// Query DOM
var loginBtn = document.querySelector("#login-button")
var loginNameInput = document.querySelector("#name")
// Emit events
loginBtn.addEventListener("click", function () {
  socket.emit("name", {name: loginNameInput.value});
});

// game started message from server
socket.on("gameStatus", function (data) {
  console.log("gameStatus : " + data)
})

// game data message
socket.on("gameData", function (data) {
  console.log("gameData : " + data)
})

// move request
socket.on("move", function (data) {
  console.log("move : " + data)
})

// drawn card data
socket.on("pushHand", function (data) {
  console.log("pushHand : " + data)
})

// request to discard cards if too many in hand
socket.on("forceDiscard", function (data) {
  console.log("foredDiscard : " + data)
})

// request to accept steal from another player (or play JSN)
socket.on("steal", function(data) {
  console.log("steal : " + data)
})

// request to pay another player
socket.on("giveCash", function() {
  console.log("giveCash : " + data)
})
