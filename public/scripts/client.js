// updates property
// each card is data[street].cards[card]
function updateProperty(user, data) {
  // empty property container
  $(".property-container.player" + user).empty();
  // loops over streets
  for (let s = 0; s < data.length; s++) {
    const street = data[s];
    const colour = data[s].colour;
    $(".property-container.player" + user).append(
      "<div class='street " + colour + "'></div>"
    );
    // loops over properties in street:
    for (let c = 0; c < street.cards.length; c++) {
      const card = street.cards[c];
      $(".street." + colour).append(
        "<div id='" +
          card.id +
          "' class='card-parent'><div class= 'mcard " +
          card.name +
          "'></div></div>"
      );
    }
  }
}

// updates money, handcards
// for user money, data = list of cards
// for other player, data.moneyTopCard, data.handCardCound, data.moneyCardCount
function updateMoney(user, data) {
  // empty money container
  $(".money-container.player" + user).empty();
  // TODO : PLAYER HAND CONTAINER
  console.log(user);
  if (user === 0) {
    // for user
    for (let c = 0; c < data.length; c++) {
      const card = data[c];
      console.log("appending user money");
      $(".money-container.player" + user).append(
        "<div class=money-parent><div id='" +
          card.id +
          "' class='mcard " +
          card.name +
          "'></div></div>"
      );
    }
  } else {
    // for other players
    for (let c = 0; c < data.moneyCardCount; c++) {
      $(".money-container.player" + user).append(
        "<div class=money-parent><div class='mcard'></div></div>"
      );
    }
    $(".money-container.player" + user).append(
      "<div class=money-parent><div class='mcard " +
        data.moneyTopCard.name +
        "'></div></div>"
    );
    // TODO - UPDATE PLAYER HANDS
  }
}

// updates deck
// data.deckCardCount, data.discardedCount, data.discardedTopCard
function updateDeck(data) {
  $("#card-pile").empty();
  $("#discard-pile").empty();
  if (data.deckCardCount !== 0) {
    for (let c = 0; c < data.deckCardCount; c++) {
      $("#card-pile").append(
        "<div class=money-parent><div class='mcard'></div></div>"
      );
    }
  }
  if (data.discardedCount !== 0) {
    for (let c = 0; c < data.discardedCount; c++) {
      $("#discard-pile").append(
        "<div class=money-parent><div class='mcard'></div></div>"
      );
    }
    $("#discard-pile").append(
      "<div class=money-parent><div class='mcard " +
        data.discardedTopCard.name +
        "'></div>"
    );
  }
}

// updates player hand
// data is list of cards
function updateHand(data) {
  $("#player-hand-container").empty();
  for (let c = 0; c < data.length; c++) {
    const card = data[c];
    $("#player-hand-container").append(
      "<div id='" + card.id + "' class='mcard " + card.name + "'></div>"
    );
  }
}

// updates lobby
// data.players[p].(name/ready)
function updateLobby(data) {
  $("#lobby-list").empty();
  for (let i = 0; i < data.length; i++) {
    const player = data.players[i];
    var ready = "waiting";
    if ((player.ready = true)) {
      ready = "ready";
    }
    $("#lobby-list").append("<li> " + player.name + " : " + ready + " </li>");
  }
}

// connect to socket
var socket = io.connect("http://localhost:4000");

/*
      EMITS
*/

// Login:
var loginNameInput = $("#name");
var loginBtn = $("#login-button");
loginBtn.on("click", function () {
  socket.emit("name", { name: loginNameInput.value });
  $(".outer-container.login").css("display", "none");
  $(".outer-container.lobby").css("display", "inline-block");
});

var readyButton = $("#ready-button");
readyButton.on("click", function () {
  socket.emit("ready", { ready: true });
});

/*
      ON MESSAGE EVENTS
*/

socket.on("connection", function () {
  console.log("connected to socket");
});

// game started message from server
socket.on("gameStatus", function (data) {
  console.log("received game status");
  if (data.gameStarted === true) {
    $(".outer-container.lobby").css("display", "none");
    $(".outer-container.game").css("display", "inline-block");
  } else {
    updateLobby(data.players);
  }
});

// game data message
socket.on("gameData", function (gameData) {
  const playerData = gameData.playerData;
  const tableData = gameData.tableData;
  const playerCount = playerData.length;
  for (let p = 0; p < playerCount; p++) {
    updateProperty(p, playerData[p].property);
    updateMoney(p, playerData[p].money);
  }
  updateHand(playerData[0].hand);
  updateDeck(gameData.tableData);
});

// move request
socket.on("move", function (data) {
  console.log("move : " + data);
  alert("Please select a card you have " + data.movesRemaining + " moves left");
  var handCards = $("#player-hand-container>.mcard");
  for (let i = 0; i < handCards.length; i++) {
    const card = handCards[i];
    card.on("click", function () {
      socket.emit("choice", { card: card.attr("id") });
    });
  }
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
