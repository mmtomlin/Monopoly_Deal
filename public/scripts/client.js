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
    for (let c = 0; c < userProperty[s].cards.length; c++) {
      const card = userProperty[s].cards[c];
      $(".street." + colour).append(
        "<div class='card-parent'><div class= 'mcard " +
          card.cardImgString +
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
  if ((user = 0)) {
    // for user
    for (let c = 0; c < data.length; c++) {
      const card = data[c];
      $("money-container.player" + user).append(
        "<div class=money-parent><div class='mcard " +
          card.cardImgString +
          "'></div></div>"
      );
    }
  } else {
    // for other players
    for (let c = 0; c < data.moneyCardCount; c++) {
      $("money-container.player" + user).append(
        "<div class=money-parent><div class='mcard'></div></div>"
      );
    }
    $("money-container.player" + user).append(
      "<div class=money-parent><div class='mcard " +
        data.moneyTopCard.cardImgString +
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
  for (let c = 0; c < data.deckCardCount; c++) {
    $("#card-pile").append(
      "<div class=money-parent><div class='mcard'></div></div>"
    );
  }
  for (let c = 0; c < data.discardedCount; c++) {
    $("#card-pile").append(
      "<div class=money-parent><div class='mcard'></div></div>"
    );
  }
  $("#card-pile").append(
    "<div class=money-parent><div class='mcard " +
      data.discardedTopCard.cardImgString +
      "'></div>"
  );
}

// updates player hand
// data is list of cards
function updateHand(data) {
  $("player-hand-container").empty();
  for (let c = 0; c < data.length; c++) {
    const card = data[c];
    $("player-hand-container").append(
      "<div class='mcard " + card.cardImgString + "'></div>"
    );
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
});

// game data message
socket.on("gameData", function (data) {
  /*
  console.log("received game data");
  // console.log(JSON.stringify(data, null, 2));
  const userProperty = data.privateData.property;
  for (let s = 0; s < userProperty.length; s++) {
    // populate user property
    const colour = userProperty[s].colour;
    $(".property-container.user").append(
      '<div class="street ' + colour + '"></div>'
    );
    for (let c = 0; c < userProperty[s].cards.length; c++) {
      const card = userProperty[s].cards[c];
      $(".street." + colour).append(
        '<div class="card-parent"><div class="mcard ' +
          card.cardImgString +
          '"></div></div>'
      );
    }
    // populate user money
    const userMoney = data.privateData.money;
    for (let i = 0; i < userMoney.length; i++) {
      const card = userMoney[i];
      $(".money-container.user").append(
        '<div class="money-parent"><div class="mcard ' +
          card.cardImgString +
          '"></div></div>'
      );
    }
    //populate user hand
    const userHand = data.privateData.hand;
    for (let i = 0; i < userHand.length; i++) {
      const card = userHand[i];
      $("#player-hand-container").append(
        '<div class="mcard ' + card.cardImgString + '">'
      );
    }
  }
  */
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
