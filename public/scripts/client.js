/*
      PLAYER INPUT FUNCTIONS (DURING TURN)
*/

function enableRearrange() {
  // spin wildcards
  const property = clientGameData.playerData[0].property;
  for (let s = 0; s < property.length; s++) {
    const street = property[s];
    for (let c = 0; c < street.cards.length; c++) {
      const card = street.cards[c];
      if (card.cardType === "propWC") {
        $("#" + card.id).hover(
          function () {
            $(this).append('<div class="flip-button"></div>');
            $(".flip-button").on("click", function () {
              console.log("flipping card " + card.id);
              socket.emit("rearrange", { flip: card.id });
            });
          },
          function () {
            $(this).empty();
          }
        );
      }
    }
  }
  // drag drop property:
  $(".player0>.street>.card-parent").unbind();
  $(".player0>.street>.card-parent").attr("draggable", "true");
  $(".player0>.street>.card-parent").on("dragstart", function () {
    draggedItem = $(this);
    setTimeout(function () {
      $(this).css("display", "none");
    }, 0);
    $(".player0.property-container").append(
      "<div class='street' id='street-new'></div>"
    );
    $(".player0>.street").on("dragover", function (event) {
      event.preventDefault();
    });
    $(".player0>.street").on("dragenter", function (event) {
      event.preventDefault();
      $(this).css("background-colour", "blue");
    });
    $(".player0>.street").on("dragleave", function (event) {
      $(this).css("background-colour", "grey");
    });
    $(".player0>.street").on("drop", function (event) {
      const cardID = draggedItem[0].firstElementChild.getAttribute("id");
      const streetID = $(this).attr("id");
      console.log("Transferring card " + cardID + " to street " + streetID);
      socket.emit("rearrange", {
        prop: {
          cardID: cardID,
          streetID: streetID,
        },
      });
    });
  });
  $(".player0>.street>.card-parent").on("dragend", function () {
    setTimeout(function () {
      $("#street-new").remove();
      $(".street").unbind();
      $(this).css("display", "block");
      draggedItem = null;
    }, 0);
  });
  // drag drop money:
  $(".player0>.money-parent>.mcard").on("click", function () {
    const card = $(this).attr("id");
    console.log("bringing card " + card + " to top of money pile");
    socket.emit("rearrange", { money: card });
  });
}

// start move:
function activateMove(remaining) {
  console.log("move : " + remaining);
  if (isMove === false) {
    isMove = true;
    const alertString =
      "Your turn, you have " + remaining + " moves remaining.";
    optAlert(alertString);
    $("#move-box").css("display", "inline-block");
    $("#btn-end-turn").click(function () {
      $("#move-box").css("display", "none");
      $("#btn-end-turn").unbind();
      $(".hand-card").removeClass("selection-highlight");
      $("#btn-end-turn").removeClass("selection-highlight");
      socket.emit("endTurn");
      isMove = false;
    });
  }
  $("#moves").html(remaining);
  if (remaining > 0) {
    $(".hand-card").addClass("selection-highlight");
    // hover animation:
    $(".hand-card").hover(
      function () {
        $(this).addClass("hand-card-hover");
      },
      function () {
        $(this).removeClass("hand-card-hover");
      }
    );
    // send card id back to server as "move" signal:
    $(".hand-card").click(function () {
      $(".hand-card").unbind();
      const cardID = $(this).attr("id");
      console.log("card picked: " + cardID);
      playCard(cardID);
      waitGameData = true;
      $(this).fadeTo(500, 0.5); //isn't working?
    });
  } else if (remaining === 0) {
    $(".hand-card").removeClass("selection-highlight");
    $("#btn-end-turn").addClass("selection-highlight");
  }
}

// get player to choose whether to play the card as cash:
function chooseIfCash(card, callback) {
  $("#options-popup").css("display", "inline-block");
  $("#options-heading").append("<p>Play card as?</p>");
  $("#options-options").append(
    "<div id='yes-btn' class='options-button'><p>Cash</p></div>"
  );
  $("#yes-btn").click(function () {
    console.log("card: " + JSON.stringify(card, null, 2));
    console.log("sending move with cardid " + card.id);
    socket.emit("move", { id: card.id, options: { playAsCash: true } });
    waitGameData = true;
    closeOptions();
  });
  $("#options-options").append(
    "<div id='no-btn' class='options-button'><p>Action</p></div>"
  );
  $("#no-btn").click(function () {
    closeOptions();
    callback(card);
  });
}

function playCard(cardID) {
  const hand = clientGameData.playerData[0].hand;
  let card = {};
  for (let c = 0; c < hand.length; c++) {
    if (hand[c].id === cardID) {
      card = hand[c];
      break;
    }
  }
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
  if (card.cardType === "rent") {
    // options object = {playAsCash: (true/false), colourPlayed: (colour) }
    chooseIfCash(card, function () {
      const colours = card.card.rentColours;
      $("#options-heading").append("<p>Pick rent colour</p>");
      for (let i = 0; i < card.card.rentColours.length; i++) {
        const colour = card.card.rentColours[i];
        $("#options-options").append(
          "<div id='btn-" + i + "' class='options-button'>" + colour + "</div>"
        );
        $("#btn-" + i).click(function () {
          socket.emit("move", {
            id: card.id,
            options: { playAsCash: false, colourPlayed: colour },
          });
          waitGameData = true;
          closeOptions();
        });
        $("#options-popup").css("display", "inline-block");
      }
    });
  } else if (card.name === "rent-any") {
    // options object = {playAsCash: (true/false), victim: (victim position), colourPlayed: (colour) }
    chooseIfCash(card, function () {
      pickVictim(function (victim) {
        pickAnyColour(function (colour) {
          socket.emit("move", {
            id: card.id,
            options: {
              playAsCash: false,
              victim: victim,
              colourPlayed: colour,
            },
          });
          waitGameData = true;
          closeOptions();
        });
      });
    });
  } else if (card.name === "deal-breaker") {
    // options object = {playAsCash: (true/false), victim: (victim position), streetID: (street id)}
    chooseIfCash(card, function () {
      pickStreet(function (victim, streetID) {
        socket.emit("move", {
          id: card.id,
          options: { playAsCash: false, victim: victim, streetID: streetID },
        });
        waitGameData = true;
        $(".street").unbind();
        $(".street").removeClass("selection-highlight");
        closeOptions();
      });
    });
  } else if (card.name === "sly-deal") {
    // options object = {payAsCash: (true/false), victim: (victim position), targetCard: targetCardID}
    chooseIfCash(card, function () {
      pickCard(function (victim, targetCardID) {
        socket.emit("move", {
          id: card.id,
          options: {
            playAsCash: false,
            victim: victim,
            targetCardID: targetCardID,
          },
        });
        waitGameData = true;
        closeOptions();
      });
    });
  } else if (card.name === "forced-deal") {
    chooseIfCash(card, function () {
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
          waitGameData = true;
          closeOptions();
        });
      });
    });
  } else if (card.name === "debt-collector") {
    // options object = {playAsCash: (true/false), victim: (victim position) }
    chooseIfCash(card, function () {
      pickVictim(function (victim) {
        socket.emit("move", {
          id: card.id,
          options: { playAsCash: false, victim: victim },
        });
        waitGameData = true;
        closeOptions();
      });
    });
  } else if (card.cardType === "propB" && hasCompleteStreet()) {
    chooseIfCash(card, function () {
      socket.emit("move", {
        id: card.id,
        options: { playAsCash: false },
      });
    });
  } else if (card.cardType === "power") {
    chooseIfCash(card, function () {
      socket.emit("move", {
        id: card.id,
        options: { playAsCash: false },
      });
    });
  } else {
    socket.emit("move", {
      id: card.id,
      options: { playAsCash: false },
    });
  }
}

function hasCompleteStreet() {
  let property = clientGameData.playerData[0].property;
  for (let s = 0; s < property.length; s++) {
    if (property[s].complete === true) return true;
  }
  return false;
}

// pick a colour for a "rentAny" card
function pickAnyColour(callback) {
  $(".mcard").removeClass("selection-highlight");
  $(".mcard").unbind();
  $("#options-heading").append("<p>Pick a colour</p>");
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
    $("#" + colour + "-opt-btn").click(function () {
      callback(colour);
      closeOptions();
    });
  }
  $("#options-popup").css("display", "inline-block");
}

// pick a target card for slydeal / forced deal
function pickCard(callback) {
  optAlert("Pick a card to steal.");
  $(".mcard").removeClass("selection-highlight");
  $(".mcard").unbind();
  for (let p = 1; p < clientGameData.playerData.length; p++) {
    const player = clientGameData.playerData[p];
    for (let s = 0; s < player.property.length; s++) {
      const street = player.property[s];
      if (!street.complete) {
        for (let c = 0; c < street.cards.length; c++) {
          const card = street.cards[c];
          $("#" + card.id).addClass("selection-highlight");
          $("#" + card.id).click(function () {
            $("#" + card.id).unbind();
            $("#" + card.id).removeClass("selection-highlight");
            callback(p, card.id);
          });
        }
      }
    }
  }
}

// pick a swap card for forced deal
function pickSwapCard(callback) {
  $(".mcard").removeClass("selection-highlight");
  $(".mcard").unbind();
  optAlert("Pick a card to swap.");
  const player = clientGameData.playerData[0];
  for (let s = 0; s < player.property.length; s++) {
    const street = player.property[s];
    for (let c = 0; c < street.cards.length; c++) {
      const card = street.cards[c];
      $("#" + card.id).addClass("selection-highlight");
      $("#" + card.id).click(function () {
        $("#" + card.id).unbind();
        $("#" + card.id).removeClass("selection-highlight");
        callback(card.id);
      });
    }
  }
}

// pick victim for rentAny, debt collector:
function pickVictim(callback) {
  $(".mcard").removeClass("selection-highlight");
  $(".mcard").unbind();
  for (let p = 1; p < clientGameData.playerData.length; p++) {
    $(".player-name.player" + p).addClass("selection-highlight");
    $(".player-name.player" + p).click(function () {
      $(".player-name").unbind();
      $(".player-name").removeClass("selection-highlight");
      callback(p);
    });
  }
}

// picks a street for deal breaker:
function pickStreet(callback) {
  $(".mcard").removeClass("selection-highlight");
  $(".mcard").unbind();
  optAlert("Pick a completed property set to steal");
  for (let p = 1; p < clientGameData.playerData.length; p++) {
    const player = clientGameData.playerData[p];
    for (let s = 0; s < player.property.length; s++) {
      const street = player.property[s];
      if (street.complete) {
        $("#street-" + street.streetID).addClass("selection-highlight");
        $("#street-" + street.streetID).click(function () {
          callback(p, street.streetID);
        });
      }
    }
  }
}

// choose hand card to discard:
function chooseDiscard(excessCards) {
  //these two shouldn't be needed, might take out.
  $(".mcard").removeClass("selection-highlight");
  $(".mcard").unbind();

  optAlert("You have too many cards, choose one to discard");
  $(".hand-card").addClass("selection-highlight");
  $(".hand-card").click(function () {
    socket.emit("discard", { id: $(this).attr("id") });
    $(".mcard").unbind();
    $(".mcard").removeClass("selection-highlight");
  });
  $(".hand-card").hover(
    function () {
      $(this).addClass("hand-card-hover");
    },
    function () {
      $(this).removeClass("hand-card-hover");
    }
  );
}

// creates alert with ok button
optAlert = function (message) {
  $("#options-heading").append("<p>" + message + "</p>");
  $("#options-options").append(
    "<div id='ok-btn' class='options-button'><p>ok</p></div>"
  );
  $("#options-popup").css("display", "inline-block");
  $("#ok-btn").click(function () {
    closeOptions();
  });
};

// hide and clear options container:
closeOptions = function () {
  $("#options-heading").empty();
  $("#options-options").empty();
  $("#options-popup").css("display", "none");
};

/*
      USER INPUT FUNCTIONS (NOT DURING TURN)
*/

// chose money card to pay current player:
function chooseValueCard(owed) {
  $(".mcard").unbind();
  optAlert("you owe " + owed + " please choose a card");
  const payCards = [];
  const money = clientGameData.playerData[0].money;
  const prop = clientGameData.playerData[0].property;
  for (let c = 0; c < money.length; c++) {
    $("#" + money[c].id).addClass("selection-highlight");
    $("#" + money[c].id).click(function () {
      $("#" + money[c].id).unbind();
      $("#" + money[c].id).css("display", "none");
      socket.emit("pay", { id: $(this).attr("id") });
    });
  }
  for (let s = 0; s < prop.length; s++) {
    const street = prop[s];
    for (let c = 0; c < street.cards.length; c++) {
      const card = street.cards[c];
      $("#" + card.id).addClass("selection-highlight");
      $("#" + card.id).click(function () {
        $("#" + card.id).unbind();
        $("#" + card.id).css("display", "none");
        socket.emit("pay", { id: $(this).attr("id") });
      });
    }
  }
}

// TO DO - tell player what has been played
// accept or play just say no, if avaliable:
function chooseAccept(options) {
  $("#options-popup").css("display", "inline-block");
  $("#options-heading").append("<p>Accept?</p>");
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    $("#options-options").append(
      "<button id='" +
        option.replace(/\s/g, "") +
        "-opt-btn' class='options-button'>" +
        option +
        "</button>"
    );
    $("#" + option.replace(/\s/g, "") + "-opt-btn").click(function () {
      socket.emit("accept", { option: option });
      closeOptions();
    });
  }
  $("#options-popup").css("display", "inline-block");
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
    updateName(p, playerData[p].name);
  }
  updateHand(playerData[0].hand);
  updateDeck(gameData.tableData);
};

function updateName(player, name) {
  $(".player-name.player" + player).html(name);
}

// updates property
// each card is data[street].cards[card]
function updateProperty(user, data) {
  // empty property container
  $(".property-container.player" + user).empty();
  // loops over streets
  for (let s = 0; s < data.length; s++) {
    const street = data[s];
    const colour = data[s].colour;
    const streetID = data[s].streetID;
    $(".property-container.player" + user).append(
      "<div class='street' id='street-" + streetID + "'></div>"
    );
    // loops over properties in street:
    for (let c = 0; c < street.cards.length; c++) {
      const card = street.cards[c];
      console.log(JSON.stringify(card, null, 2));
      $("#street-" + streetID).append(
        "<div class='card-parent'><div id='" +
          card.id +
          "' class= 'mcard " +
          card.name +
          "'></div></div>"
      );
      if (card.flipped) {
        $("#" + card.id).addClass("flip");
      }
    }
  }
  $(".player0>.street>.card-parent>.mcard").hover(
    function () {
      $(this).addClass("z-index-1");
    },
    function () {
      $(this).removeClass("z-index-1");
    }
  );
}

// updates money, handcards
// for user money, data = list of cards
// for other player, data.moneyTopCard, data.handCardCound, data.moneyCardCount
function updateMoney(player, data) {
  // empty money container
  $(".money-container.player" + player).empty();
  // TODO : OTHER PLAYER HAND CONTAINER
  if (player === 0) {
    // for user
    for (let c = 0; c < data.length; c++) {
      const card = data[c];
      $(".money-container.player" + player).append(
        "<div class='money-parent' id='prnt-" +
          card.id +
          "'><div id='" +
          card.id +
          "' class='mcard " +
          card.name +
          "'></div></div>"
      );
      $("#prnt-" + card.id).hover(
        function () {
          $(this).addClass("money-parent-hover");
        },
        function () {
          $(this).removeClass("money-parent-hover");
        }
      );
    }
  } else {
    // for other players
    for (let c = 0; c < data.moneyCardCount - 1; c++) {
      $(".money-container.player" + player).append(
        "<div class=money-parent><div class='mcard money-pile-card'></div></div>"
      );
    }
    if (data.moneyCardCount > 0) {
      $(".money-container.player" + player).append(
        "<div class=money-parent><div class='mcard money-pile-card " +
          data.moneyTopCard.name +
          "'></div></div>"
      );
    }
    // TODO - UPDATE PLAYER HANDS
  }
  $(".money-container.player0").hover(
    function () {
      $(".player0>.money-parent").addClass("money-parent-container-hover");
    },
    function () {
      $(".player0>money-parent").removeClass("money-parent-container-hover");
    }
  );
}

// updates deck
// data.deckCardCount, data.discardedCount, data.discardedTopCard
function updateDeck(data) {
  $("#card-pile").empty();
  $("#discard-pile").empty();
  if (data.deckCardCount !== 0) {
    for (let c = 0; c < data.deckCardCount; c++) {
      $("#card-pile").append(
        "<div class=deck-card-parent><div class='mcard'></div></div>"
      );
    }
  }
  if (data.discardedCount !== 0) {
    for (let c = 0; c < data.discardedCount - 1; c++) {
      $("#discard-pile").append(
        "<div class=deck-card-parent><div class='mcard'></div></div>"
      );
    }
    $("#discard-pile").append(
      "<div class=deck-card-parent><div class='mcard " +
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
var waitGameData = false;
const uTime = 200;
var clientGameData = {};
var draggedItem = null;
var isMove = false;

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
  console.log("received gameData");
  clientGameData = gameData;
  updateAllGameData(gameData);
  waitGameData = false;
});

// move request
socket.on("moveRequest", function (data) {
  setTimeout(function () {
    console.log("received moveRequest");
    while (waitGameData) {
      console.log("waiting");
    }
    console.log("activating move");
    activateMove(data.movesRemaining);
    enableRearrange();
  }, uTime);
});

// get options request
socket.on("getOptions", function (data) {
  setTimeout(function () {
    console.log("received getOptions");
    console.log(JSON.stringify(data, null, 2));
    console.log(data.card.id);
    chooseIfCash(data.card);
  }, uTime);
});

// request to pay another player
socket.on("payRequest", function (data) {
  setTimeout(function () {
    console.log("received payRequest");
    while (waitGameData) {}
    chooseValueCard(data.amount);
  }, uTime);
});

// request to discard cards if too many in hand
socket.on("forceDiscard", function (data) {
  setTimeout(function () {
    console.log("received forceDiscard");
    chooseDiscard(data.excessCards);
  }, uTime);
});

// request to accept steal from another player (or play JSN)
socket.on("acceptRequest", function (data) {
  setTimeout(function () {
    console.log("received acceptRequest");
    chooseAccept(data.options);
  }, uTime);
});

socket.on("gameEnd", function (data) {
  optAlert(data.winner + " is the winner!!");
});
