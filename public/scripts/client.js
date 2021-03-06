/*
      PLAYER INPUT FUNCTIONS (DURING TURN)
*/

function makeSound(soundName) {
  // current sounds are  : meow, pan-1, bell-1, bell-2, card-1.
  const sound = new Audio("audio/" + soundName + ".wav");
  sound.play();
}

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
          streetID: streetID.substring(7),
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
function activateMove() {
  console.log("move : " + movesRemaining);
  if (isMove === false) {
    isMove = true;
    makeSound("bell-2");
  }
  $("#message-button").unbind();
  $("#message-button").css("display", "flex");
  $("#message-text").html(
    "Your turn, you have " + movesRemaining + " moves left."
  );
  $("#message-button").html("END MOVE");
  $(".message-box").css("display", "flex");
  $(".message-box").addClass("pink");
  $("#message-button").click(function () {
    $(".message-box").css("display", "none");
    $("#message-button").unbind();
    $(".hand-card").removeClass("selection-highlight");
    $("#message-button").removeClass("selection-highlight");
    socket.emit("endTurn");
    isMove = false;
    $(".message-box").removeClass("pink");
  });

  $("#moves").html(movesRemaining);
  if (movesRemaining > 0) {
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
    });
  } else if (movesRemaining === 0) {
    $(".hand-card").removeClass("selection-highlight");
    $("#message-button").addClass("selection-highlight");
  }
}

// get player to choose whether to play the card as cash:
function chooseIfCash(card, callback) {
  showCancelButton();
  $("#" + card.id).append("<div id='card-popup'><p>Play card as?</p></div>");
  $("#card-popup").append(
    "<div class=options><div id='yes-btn' class='options-button'><p>Cash</p></div></div>"
  );
  $("#yes-btn").click(function () {
    console.log("sending move with cardid " + card.id);
    socket.emit("move", { id: card.id, options: { playAsCash: true } });
    waitGameData = true;
    $("#" + card.id).empty();
  });
  $(".options").append(
    "<div id='no-btn' class='options-button'><p>Action</p></div>"
  );
  $("#no-btn").click(function () {
    $("#" + card.id).empty();
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
          optAlert("waiting for rent to be paid");
          closeOptions();
        });
        $("#options-popup").css("display", "inline-block");
      }
    });
  } else if (card.name === "rent-any") {
    // options object = {playAsCash: (true/false), victim: (victim position), colourPlayed: (colour) }
    chooseIfCash(card, function () {
      pickVictim(function (victim) {
        pickAnyColour(card, function (colour) {
          socket.emit("move", {
            id: card.id,
            options: {
              playAsCash: false,
              victim: victim,
              colourPlayed: colour,
            },
          });
          waitGameData = true;
          optAlert("waiting for rent to be paid");
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
        console.log("sending streetID: " + streetID);
        waitGameData = true;
        optAlert(
          "waiting for response from " + clientGameData.playerData[victim].name
        );
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
        optAlert(
          "waiting for response from " + clientGameData.playerData[victim].name
        );
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
          optAlert(
            "waiting for response from " +
              clientGameData.playerData[victim].name
          );
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
        optAlert(
          "waiting for response from " + clientGameData.playerData[victim].name
        );
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
  } else if (card.cardType === "justSayNo") {
    if (canPlayJustSayNo) {
      chooseIfCash(card, function () {
        socket.emit("move", {
          id: card.id,
          options: { playAsCash: false },
        });
      });
    } else {
      socket.emit("move", {
        id: card.id,
        options: { playAsCash: true },
      });
    }
  } else {
    socket.emit("move", {
      id: card.id,
      options: { playAsCash: false },
    });
    if (card.name == "its-my-birthday") optAlert("waiting for rent");
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
function pickAnyColour(card, callback) {
  showCancelButton();
  $("#" + card.id).append(
    "<div id='card-popup'><p>Choose colour:</p><div class='options'></div></div>"
  );
  const colours = [
    "red",
    "dblue",
    "lblue",
    "green",
    "utility",
    "rail",
    "brown",
    "orange",
    "pink",
    "yellow",
  ];
  for (let i = 0; i < colours.length; i++) {
    const colour = colours[i];
    $(".options").append("<div class='colour-option " + colour + "'></div>");
    $(".colour-option." + colour).click(function () {
      $("#" + card.id).empty();
      callback(colour);
    });
  }
}

function showCancelButton() {
  $("#message-button").unbind();
  $("#message-button").css("display", "flex");
  $("#message-button").html("Cancel");
  $("#message-button").click(function () {
    activateMove();
  });
}

// pick a target card for slydeal / forced deal
function pickCard(callback) {
  $(".message-box").css("display", "flex");
  $("#message-text").html("Pick a card to steal");
  showCancelButton();
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
            $(".mcard").unbind();
            $(".mcard").removeClass("selection-highlight");
            callback(p, card.id);
          });
        }
      }
    }
  }
}

// pick a swap card for forced deal
function pickSwapCard(callback) {
  $(".message-box").css("display", "flex");
  $("#message-text").html("Pick a card to swap");
  showCancelButton();
  $(".mcard").removeClass("selection-highlight");
  $(".mcard").unbind();
  const player = clientGameData.playerData[0];
  for (let s = 0; s < player.property.length; s++) {
    const street = player.property[s];
    for (let c = 0; c < street.cards.length; c++) {
      const card = street.cards[c];
      $("#" + card.id).addClass("selection-highlight");
      $("#" + card.id).click(function () {
        $(".mcard").unbind();
        $(".mcard").removeClass("selection-highlight");
        callback(card.id);
      });
    }
  }
}

// pick victim for rentAny, debt collector:
function pickVictim(callback) {
  $(".message-box").css("display", "flex");
  $("#message-text").html("Pick a person");
  showCancelButton();
  $(".mcard").removeClass("selection-highlight");
  $(".mcard").unbind();
  for (let p = 1; p < clientGameData.playerData.length; p++) {
    $(".player" + p + ">.avatar").addClass("selection-highlight");
    $(".player" + p + ">.avatar").click(function () {
      $(".avatar").unbind();
      $(".avatar").removeClass("selection-highlight");
      callback(p);
    });
  }
}

// picks a street for deal breaker:
function pickStreet(callback) {
  $(".message-box").css("display", "flex");
  $("#message-text").html("Pick a street to steal");
  showCancelButton();
  $(".mcard").removeClass("selection-highlight");
  $(".mcard").unbind();
  for (let p = 1; p < clientGameData.playerData.length; p++) {
    const player = clientGameData.playerData[p];
    for (let s = 0; s < player.property.length; s++) {
      const street = player.property[s];
      if (street.complete) {
        $("#street-" + street.streetID).addClass("selection-highlight");
        $("#street-" + street.streetID).click(function () {
          console.log("street ID = " + street.streetID);
          callback(p, street.streetID);
        });
      }
    }
  }
}

// choose hand card to discard:
function chooseDiscard(excessCards) {
  $(".message-box").css("display", "flex");
  $("#message-text").html("Discard cards:");
  $("#message-button").css("display", "none");
  //these two shouldn't be needed, might take out.
  $(".mcard").removeClass("selection-highlight");
  $(".mcard").unbind();
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
  $(".message-box").css("display", "flex");
  $("#message-text").html(message);
  $("#message-button").css("display", "none");
  /*
  $("#options-heading").append("<p>" + message + "</p>");
  $("#options-options").append(
    "<div id='ok-btn' class='options-button'><p>ok</p></div>"
  );
  $("#options-popup").css("display", "inline-block");
  $("#ok-btn").click(function () {
    closeOptions();
  });
  */
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

function valueSelect(card, owed) {
  $("#" + card.id).addClass("selection-highlight");
  $("#" + card.id).click(function () {
    $(".mcard").unbind();
    $(".mcard").removeClass("selection-highlight");
    $("#" + card.id).css("display", "none");
    owed = owed - card.card.value;
    if (owed > 0) {
      chooseValueCard(owed);
    }
    $(".message-box").removeClass("pink");
    socket.emit("pay", { id: $(this).attr("id") });
  });
}

// chose money card to pay current player:
function chooseValueCard(owed) {
  $(".message-box").addClass("pink");
  optAlert("You owe " + owed + " please choose a card");
  $(".mcard").unbind();
  const payCards = [];
  const money = clientGameData.playerData[0].money;
  const prop = clientGameData.playerData[0].property;
  for (let c = 0; c < money.length; c++) {
    valueSelect(money[c], owed);
  }

  for (let s = 0; s < prop.length; s++) {
    const street = prop[s];
    for (let c = 0; c < street.cards.length; c++) {
      valueSelect(street.cards[c], owed);
    }
  }

  const hand = clientGameData.playerData[0].hand.length;
  for (let c = 0; c < hand.length; c++) {
    const card = hand[c];
    if (card.cardType === "justSayNo") {
      $("#" + card.id).addClass("selection-highlight");
      $("#" + card.id).click(function () {
        $("#" + card.id).unbind();
        $("#" + card.id).css("display", "none");
        socket.emit("pay", { justSayNo: card.id });
      });
    }
  }
}

// TO DO - tell player what has been played
// accept or play just say no, if avaliable:
function chooseAccept(options, message) {
  $("#options-heading").empty();
  $("#options-options").empty();
  $("#options-heading").append("<p>" + message + "</p>");
  $(".message-box").addClass("pink");
  for (let i = 0; i < options.length; i++) {
    const option = options[i];
    $("#options-options").append(
      "<div id='" +
        option.replace(/\s/g, "") +
        "-opt-btn' class='options-button'>" +
        option +
        "</div>"
    );
    $("#" + option.replace(/\s/g, "") + "-opt-btn").click(function () {
      $(".message-box").removeClass("pink");
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
  $(".player-area").addClass("p" + playerData.length);
  for (let p = 0; p < playerCount; p++) {
    updateProperty(p, playerData[p].property);
    updateMoney(p, playerData[p].money);
    updateName(p, playerData[p].name);
  }
  updateHand(playerData[0].hand);
  updateDeck(gameData.tableData);
  optAlert(gameData.gameMessage);
  $(".message-box").removeClass("pink");
};

function updateName(player, name) {
  $(".player-details.player" + player).html(
    '<div class="avatar"></div><div class="player-name">' + name + "</div>"
  );
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
  // hovers
  $(".player-area.player" + user).hover(
    function () {
      $(".player-area.player" + user).css("z-index", "1");
      $(".player-area.player" + user).addClass("wide-player-area");
      $(".player" + user + ">.street").addClass("medium-street");
      $(".property-container.player" + user).addClass(
        "property-container-wide"
      );
      $(".player" + user + ">.street>.card-parent>.mcard").addClass(
        "medium-mcard"
      );
      $(".player" + user + ">.money-parent>.mcard").addClass("medium-mcard");
    },
    function () {
      $(".player-area.player" + user).css("z-index", "0");
      $(this).removeClass("wide-player-area");
      $(".player-area.player" + user).removeClass("wide-player-area");
      $(".player" + user + ">.street").removeClass("medium-street");
      $(".property-container.player" + user).removeClass(
        "property-container-wide"
      );
      $(".player" + user + ">.street>.card-parent>.mcard").removeClass(
        "medium-mcard"
      );
      $(".player" + user + ">.money-parent>.mcard").removeClass("medium-mcard");
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
    $("#lobby-list").append(
      "<div class='lobby-li player" +
        i +
        "'> <div class='avatar player" +
        i +
        "'></div> <span class='lobby-name'> </span> <span class='lobby-wait'> </span> </div>"
    );
    $(".player" + i + ">.lobby-name").html(player.name);
    if (player.ready) {
      $(".player" + i + ">.lobby-wait").html("READY");
      $(".lobby-li.player" + i).css(
        "background-color",
        "rgba(250, 100, 200, 0.9)"
      );
    } else if (!player.ready && i != data.position) {
      $(".player" + i + ">.lobby-wait").html("WAITING");
    }
    if (i == data.position) {
      $(".player" + i + ">.lobby-wait").addClass("ready-button");
      if (!player.ready) {
        $(".player" + i + ">.lobby-wait").html("READY?");
      }
    }
    $(".ready-button").unbind();
    $(".ready-button").on("click", function () {
      socket.emit("ready", {});
    });
  }
}

/*
      MAIN:
*/

// connect to socket
var socket = io.connect(window.location.hostname);
var waitGameData = false;
const uTime = 200;
var clientGameData = {};
var draggedItem = null;
var isMove = false;
var movesRemaining = 0;
var canPlayJustSayNo = false;

// Login:
var loginNameInput = $("#name");
var loginBtn = $("#login-button");
loginBtn.on("click", function () {
  socket.emit("name", { name: loginNameInput.val() });
});

/*
      ON MESSAGE EVENTS
*/

socket.on("connection", function () {
  console.log("connected to socket");
});

// game started message from server
socket.on("gameStatus", function (data) {
  $(".outer-container.login").css("display", "none");
  $(".outer-container.lobby").css("display", "inline-block");
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
  makeSound("card-1");
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
    movesRemaining = data.movesRemaining;
    canPlayJustSayNo = data.canPlayJustSayNo;
    activateMove();
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
  makeSound("pan-1");
  setTimeout(function () {
    console.log("received payRequest");
    while (waitGameData) {}
    chooseValueCard(data.amount);
  }, uTime);
});

// request to discard cards if too many in hand
socket.on("forceDiscard", function (data) {
  makeSound("meow");
  setTimeout(function () {
    console.log("received forceDiscard");
    chooseDiscard(data.excessCards);
  }, uTime);
});

// request to accept steal from another player (or play JSN)
socket.on("acceptRequest", function (data) {
  makeSound("pan-1");
  setTimeout(function () {
    console.log("received acceptRequest");
    chooseAccept(data.options, data.message);
  }, uTime);
});

socket.on("gameEnd", function (data) {
  optAlert(data.winner + " is the winner!!");
});
