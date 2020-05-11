// connect to socket
var socket = io.connect("http://localhost:4000");

// login page
/* dont need this with jquery:
var loginOverlay = $("#login-overlay"); // document.querySelector("login-overlay");
var loginBtn = document.querySelector("#login-button");
var loginNameInput = document.querySelector("#name");
// lobby page
var lobbyOverlay = document.querySelector("#lobbyOverlay");
var gameContainer = document.querySelector("#game-container");
*/

/*
      EMITS
*/

// Emit events

var loginNameInput = document.querySelector("#name");
var loginBtn = document.querySelector("#login-button");
loginBtn.addEventListener("click", function () {
  socket.emit("name", { name: loginNameInput.value });
});

/*
      ON MESSAGE EVENTS
*/

// game started message from server
socket.on("gameStatus", function (data) {
  console.log("whoa");
});

// game data message
socket.on("gameData", function (data) {
  // console.log(JSON.stringify(data, null, 2));
  const userProperty = data.privateData.property;

  for (let s = 0; s < userProperty.length; s++) {
    const colour = userProperty[s].colour;
    $(".property-container.user").append(
      '<div class="street ' + colour + '"></div>'
    );
    for (let c = 0; c < userProperty[s].cards.length; c++) {
      $(".street." + colour).append(
        '<div class="card-parent"><div class="mcard ' +  + '"></div></div></div>'
      );
    }
  }
  console.log("gameData : " + data);
});

// move request
socket.on("move", function (data) {
  console.log("move : " + data);
});

// drawn card data
socket.on("pushHand", function (data) {
  console.log("pushHand : " + data);
});

// request to discard cards if too many in hand
socket.on("forceDiscard", function (data) {
  console.log("foredDiscard : " + data);
});

// request to accept steal from another player (or play JSN)
socket.on("steal", function (data) {
  console.log("steal : " + data);
});

// request to pay another player
socket.on("giveCash", function () {
  console.log("giveCash : " + data);
});
