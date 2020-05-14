const fs = require("fs");

const Street = require(__dirname + "/street.js");

module.exports = Player;

// Player prototype
function Player(socket, name, position) {
  this.name = name;
  this.socket = socket;
  this.id = socket.id;
  this.hand = [];
  this.property = [];
  this.money = [];
  this.isReady = false;
  this.position = position;
  this.movesRemaining = 0;
  this.rentMultiplier = 1;

  // player turn:
  this.startTurn = function (game) {
    this.drawCards(game.deck, 2);
    this.movesRemaining = 3;
    this.socket.emit("move", {
      movesRemaining: this.movesRemaining,
    });
  };

  this.drawCards = function (deck, amount) {
    for (let i = 0; i < amount; i++) {
      this.hand.push(deck.drawCard());
    }
  };

  // get private data for this player
  this.getPrivateData = function () {
    return {
      name: this.name,
      property: this.property,
      money: this.money,
      hand: this.hand,
      movesRemaining: this.movesRemaining,
    };
  };

  // get public data for this player
  this.getPublicData = function () {
    return {
      name: this.name,
      property: this.property,
      // number of hand cards counted as "money" to make things easier
      money: {
        moneyTopCard: this.money[0],
        moneyCardCount: this.money.length,
        handCardCount: this.hand.length,
      },
      movesRemaining: this.movesRemaining,
    };
  };

  // send all game data to client
  this.sendAllGameData = function (game) {
    // gets data from other players relative to this player position
    var playerData = [];
    // inserts user player at position[0]
    playerData.push(this.getPrivateData());
    var relPos = positionRelative(game.players.length, this.position);
    for (let i = 1; i < relPos.length; i++) {
      // i=1 to not include user player
      p = relPos[i];
      playerData.push(game.players[p].getPublicData());
    }
    // Collates and sends game data
    gameData = {
      playerData: playerData,
      tableData: game.getDeckPublicData(),
    };
    // emits game data
    this.socket.emit("gameData", gameData);
    fs.writeFile(
      "test_game_data.json",
      JSON.stringify(gameData, null, 2),
      function () {
        console.log("JSON game data file written");
      }
    );
  };

  // self-explanatory
  this.popHandCardById = function (id) {
    for (let c = 0; c < this.hand.length; c++) {
      if (this.hand[c].id === id) {
        return this.hand.splice(c, 1);
      }
    }
  };

  this.popPropCardById = function (id) {
    for (let s = 0; s < this.property.length; s++) {
      for (let c = 0; c < this.property[s].length; c++) {
        const card = this.property[s][c].card;
        if (card.id == id) {
          return card; 
        }
      }
    }
  };

  //self explanatory
  this.getRentAmountByColour = function (colour) {
    var rentAmount = 0;
    for (let s = 0; s < this.property.length; s++) {
      if (this.property[s].colour === colour) {
        const rent = this.property[s].getRentAmount();
        if (rent > rentamount) {
          rentAmount = rent;
        }
      }
    }
    return rentAmount;
  };

  this.reArrangeCash = function (game) {
    //TODO
  };

  this.reArrangeProperty = function (game) {
    //TODO
  };

  this.chargeOthers = function (amount, game) {
    for (let p = 0; p < game.players.length; p++) {
      const player = game.players[p];
      if (player.id !== this.id) {
        player.giveMoney(amount, this)
      }
    }
  };

  this.chargeOther = function (amount, player) {
    player.giveMoney(amount, this)
  };

  this.giveMoney = function (amount, player) {
    this.moneyOwed = amount;
    this.socket.emit("pay", amount);
  }

  // deals with a card picked by player as part of move
  // id is card id from client
  this.playHandCard = function (id, game, options = null) {
    // TODO
    // need to organise this better
    // need to create mechanism to start next turn etc. decrement moveRemaining
    // wait for money, or accept steal etc.
    // need to discard card
    for (let c = 0; c < this.cards.length; c++) {
      const card = this.cards[c];
      // double checks if card exists in hand
      if (card.id === id) {
        this.movesRemaining--;
        // if card is cash, add to cash
        if (card.cardType === "cash" || card.cardType === "justSayNo") {
          this.money.push(this.popHandCardById(id));
          // if card is prop / propAny / propWC, add to property
        } else if (card.cardType.slice(0, 4) === "prop") {
          this.addCardToProp(this.popHandCardById(id), game);
          // else the card needs options as it has more than one use
          // if options are defined:
        } else if (options !== null) {
          // trigger card power
          card.card.power(this, game, options);
          // else we need to get options from user:
        } else {
          card.getOptions(this);
          this.movesRemaining++;
          break;
        }
      }
    }
  };
}

this.hasJustSayNo = function () {
  //TODO
};

// checks if hand has more cards than allowed
this.checkHandTooBig = function (game) {
  const excessCards = this.hand.cards.length - game.maxHandCards;
  if (excessCards > 0) {
    this.socket.emit("forceDiscard", excessCards);
  }
};

this.addCardToProp = function (card, game) {
  colour = card.card.colour;
  var colourPresent = false;
  for (let i = 0; i < this.property.length; i++) {
    if (colour === this.property[i].colour) {
      colourPresent = true;
      this.property[i].cards.push(card);
      break;
    }
  }
  if (!colourPresent) {
    this.property.push(new Street(card, game));
  }
};
