/*
      PLAYER INPUT FUNCTIONS (DURING TURN)
*/

// start move:
function activateMove(remaining) {
  console.log("move : " + data.movesRemaining);
  alert("Please select a card you have " + data.movesRemaining + " moves left");
  // hover animation:
  $("#player-hand-container>.mcard").hover(
    function () {
      $(this).addClass("hand-card-hover");
    },
    function () {
      $(this).removeClass("hand-card-hover");
    }
  );
  // send card id back to server as "move" signal:
  $("#player-hand-container>.mcard").click(function () {
    $("#player-hand-container>.mcard").unbind();
    const cardID = $("this").attr("id");
    socket.emit("move", { id: cardID });
    $(this).fadeTo(500, 0.5); //isn't working?
  });
}

// get player to choose whether to play the card as cash:
function chooseIfCash(card) {
  $("#options-popup").css("display", "inline-block");
  $("#options-heading").append("Play card as cash?");
  $("#options-options").append(
    "<div id='yes-btn' class='options-button'>Yes</div>"
  );
  $("#yes-btn").click(function (card) {
    socket.emit("move", { id: card.id, options: { playAsCash: true } });
    closeOptions();
  });
  $("#options-options").append(
    "<div id='no-btn' class='options-button'>No</div>"
  );
  $("#no-btn").click(function (card) {
    getFurtherOptions(card);
    closeOptions();
  });
}

// get further options if card isn't played as cash:
function getFurtherOptions(card, yes) {
  /*
   cardTypes = [
    "rent", - COLOUR 1 / COLOUR 2 / RENT
    "rentAny", - COLOUR , PLAYER
    "power", - POWER / CASH
        "dealBreaker" - pick a street
        "slyDeal" - pick a card
        "forcedDeal" - pick user card, pick opponent card
        "debtCollector" - pick player
        "rentAny" - pick player, pick colour
        "doubleTheRent", "itsMyBirthday", "passGo" - none      
    "propB", PROPERTY (IF COMPLETE PROPERTIES) / POWER
  ];
  */
  $("#options-popup").css("display", "inline-block");
  if (card.cardType === "rent") {
    // options object = {playAsCash: (true/false), colourPlayed: (colour) }
    const colours = card.card.rentColours;
    $("#options-heading").append("Pick rent colour:");
    $("#options-options").append(
      "<div id='btn-1' class='options-button'>" + colours[0] + "</div>"
    );
    $("#btn-1").click(function (card) {
      socket.emit("move", {
        id: card.id,
        options: { playAsCash: false, colourPlayed: colours[0] },
      });
      closeOptions();
    });
    $("#options-options").append(
      "<div id='btn-2' class='options-button'>" + colours[1] + "</div>"
    );
    $("#btn-2").click(function (card) {
      socket.emit("move", {
        id: card.id,
        options: { playAsCash: false, colourPlayed: colours[1] },
      });
      closeOptions();
    });
  } else if (card.cardType === "rentAny") {
    // options object = {playAsCash: (true/false), victim: (victim position), colourPlayed: (colour) }
    pickVictim(function (Victim) {
      pickAnyColour(function (Colour) {
        socket.emit("move", {
          id: card.id,
          options: { playAsCash: false, victim: victim, colourPlayed: colour },
        });
        closeOptions();
      });
    });
  } else if (card.name === "dealBreaker") {
    // options object = {playAsCash: (true/false), victim: (victim position), streetID: (street id)}
    pickStreet(function (victim, streetID) {
      socket.emit("move", {
        id: card.id,
        options: { playAsCash: false, victim: victim, streetID: streetID },
      });
      closeOptions();
    });
  } else if (card.name === "slyDeal") {
    // options object = {playAsCash: (true/false), victim: (victim position), targetCard: targetCardID}
    pickCard(function (victim, cardID) {
      socket.emit("move", {
        id: card.id,
        options: {
          playAsCash: false,
          victim: victim,
          targetCardID: targetCardID,
        },
      });
      closeOptions();
    });
  } else if (card.name === "forcedDeal") {
    // options object = {playAsCash: (true/false), victim: (victim position), targetCardID, swapCardID }
    pickCard(function (victim, targetCardID) {
      pickSwapCard(function (swapCardID) {
        socket.emit("move", {
          id: card.id,
          options: {
            playAsCash: false,
            victim: victim,
            targetCardID: targetCardID,
            swapCardID: swapCardID,
          },
        });
        closeOptions();
      });
    });
  } else if (card.name === "debtCollector") {
    // options object = {playAsCash: (true/false), victim: (victim position) }
    pickVictim(function (victim) {
      socket.emit("move", {
        id: card.id,
        options: { playAsCash: false, victim: victim },
      });
      closeOptions();
    });
  } else {
    console.log(card.name + " not recognised, no options defined");
  }
}

// pick a colour for a "rentAny" card
function pickAnyColour(callback) {
  $("#options-heading").append("Pick a colour");
  const colours = [
    "red",
    "dblue",
    "lblue",
    "green",
    "utility",
    "rail",
    "brown",
    "orange",
    "purple",
    "yellow",
  ];
  for (let i = 0; i < colours.length; i++) {
    const colour = colours[i];
    $("#options-options").append(
      "<div id='" +
        colour +
        "-opt-btn' class='options-button'>" +
        colour +
        "</div>"
    );
    $(colour + "-opt-btn").click(function (card) {
      callback(colour);
    });
  }
  $("#options-popup").css("display", "inline-block");
}

// pick a target card for slydeal / forced deal
function pickCard(callback) {
  $("#options-heading").append("Pick a colour");
  $("#options-popup").css("display", "inline-block");
  let victim = prompt("victim relpos");
  let targetCardID = prompt("target card id:");
  // TOD0 - UPDATE THIS TO INTERACTIVE
  callback(victim, targetCardID);
}

// pick a swap card for forced deal
function pickSwapCard(callback) {
  $("#options-heading").append("Pick property card to swap");
  $("#options-popup").css("display", "inline-block");
  let cardID = prompt("swap card id:");
  //TODO UPDATE THIS TO INTERACTIVE
  callback(cardID);
}

// pick victim for rentAll, dealbreaker:
function pickVictim(callback) {
  $("#options-heading").append("Pick a colour");
  $("#options-popup").css("display", "inline-block");
  let victim = "victim rel pos:";
  // TODO
  callback(victim);
}

// picks a street for deal breaker:
function pickStreet(callback) {
  $("#options-heading").append("Pick a colour");
  $("#options-popup").css("display", "inline-block");
  let victim = "victim rel pos:";
  let streetID = prompt("target street ID:");
  // TODO - CAN ONLY PICK FULL STREETS?
  // TODO - NEED TO GIVE FULL STREETS EXTRA PROPERTY / DISPLAY
  callback(victim, streetID);
}

// choose hand card to discard:
function chooseDiscard() {
  let card = prompt("discard card with id: ");
  socket.emit("discard", { id: card });
}

// hide and clear options container:
function closeOptions() {
  $("options-heading").empty();
  $("options-options").empty();
  $("#options-popup").css("display", "none");
}

/*
      USER INPUT FUNCTIONS (NOT DURING TURN)
*/

// accept or play just say no, if avaliable:
function chooseAccept(options) {
  $("#options-heading").append("Pick a colour");
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    $("#options-options").append(
      "<div id='" +
        option +
        "-opt-btn' class='options-button'>" +
        option +
        "</div>"
    );
    $(colour + "-opt-btn").click(function (card) {
      socket.emit("accept", { option: "accept" });
      $("#options-popup").css("display", "none");
    });
  }
  $("#options-popup").css("display", "inline-block");
}

// chose money card to pay current player:
function chooseValueCard(owed) {
  let card = prompt("you owe " + owed + " choose value card id");
  socket.emit("pay", { id: card });
}

/*
    UPDATING DOM TO SHOW GAME STATE:
*/

// Updates all game data:
updateAllGameData = function (gameData) {
  const playerData = gameData.playerData;
  const tableData = gameData.tableData;
  const playerCount = playerData.length;
  for (let p = 0; p < playerCount; p++) {
    updateProperty(p, playerData[p].property);
    updateMoney(p, playerData[p].money);
  }
  updateHand(playerData[0].hand);
  updateDeck(gameData.tableData);
};

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
function updateMoney(player, data) {
  // empty money container
  $(".money-container.player" + player).empty();
  // TODO : PLAYER HAND CONTAINER
  console.log(player);
  if (player === 0) {
    // for user
    for (let c = 0; c < data.length; c++) {
      const card = data[c];
      console.log("appending user money");
      $(".money-container.player" + player).append(
        "<div class=money-parent><div id='" +
          card.id +
          "' class='mcard " +
          card.name +
          "'></div></div>"
      );
    }
  } else {
    // for other players
    for (let c = 0; c < data.moneyCardCount - 1; c++) {
      $(".money-container.player" + player).append(
        "<div class=money-parent><div class='mcard'></div></div>"
      );
    }
    if (data.moneyCardCount > 0) {
      $(".money-container.player" + player).append(
        "<div class=money-parent><div class='mcard " +
          data.moneyTopCard.name +
          "'></div></div>"
      );
    }
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
      "<div id='" +
        card.id +
        "' class='mcard hand-card " +
        card.name +
        "'></div>"
    );
  }
}

// updates lobby
// data.players[p].(name/ready)
function updateLobby(data) {
  $("#lobby-list").empty();
  for (let i = 0; i < data.players.length; i++) {
    const player = data.players[i];
    if (player.ready) {
      var ready = "ready";
    } else {
      var ready = "waiting";
    }
    $("#lobby-list").append("<li> " + player.name + " : " + ready + " </li>");
  }
}

/*
      MAIN:
*/

// connect to socket
var socket = io.connect("http://localhost:4000");

// Login:
var loginNameInput = $("#name");
var loginBtn = $("#login-button");
loginBtn.on("click", function () {
  socket.emit("name", { name: loginNameInput.val() });
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
  updateGameStatus(data)
  console.log("received game status");
  if (data.gameStarted === true) {
    console.log("game is starting");
    $(".outer-container.lobby").css("display", "none");
    $(".outer-container.game").css("display", "inline-block");
  } else {
    console.log("updating lobby");
    updateLobby(data);
  }
});

// game data message
socket.on("gameData", function (gameData) {
  updateAllGameData (gameData);
});

// move request
socket.on("moveRequest", function (data) {
  activateMove(data.movesRemaining);
});

socket.on("getOptions", function (data) {
  chooseIfCash(data.card);
});

socket.on("payRequest", function (data) {
  chooseValueCard(data.amount);
});

// request to discard cards if too many in hand
socket.on("forceDiscard", function (data) {
  chooseDiscard(data.excessCards);
});

// request to accept steal from another player (or play JSN)
socket.on("acceptRequest", function (data) {
  chooseAccept(data.options);
});
