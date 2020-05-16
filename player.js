const fs = require("fs");

const Street = require(__dirname + "/street.js");

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
  this.moneyOwes = 0; // used if this player owes another money
  this.loadedPower = null; // loads power function to execute if target player accepts
  this.waitResponse = false; // waiting for a response from this player

  /* 
      PLAYER TURN LOGIC:
  */

  //
  this.startTurn = function (game) {
    this.drawCards(game.deck, 2);
    this.movesRemaining = 3;
    this.continueTurn(game);
  };

  //
  this.continueTurn = function (game) {
    this.socket.emit("moveRequest", {
      movesRemaining: this.movesRemaining,
    });
  };

  //
  this.finishMove = function () {
    // as long as player is not waiting for inputs:
    if (!waitResponse) {
      // if no moves left - end of turn
      if (this.movesRemaining === 0) {
        if (!this.checkHandTooBig()) {
          game.continue();
        }
      } else {
        this.continueTurn(game);
      }
    }
  };

  //
  this.playHandCard = function (id, game, options = null) {
    // get card
    let card = this.popHandCardById(id);
    game.deck.discarded.push(card);
    this.movesRemaining--;
    // if card is cash, add to cash
    if (card.cardType === "cash" || card.cardType === "justSayNo") {
      this.money.push(card);
      // if card is prop / propAny / propWC, add to property
    } else if (card.cardType.slice(0, 4) === "prop") {
      this.addCardToProp(card);
      // else the card needs options as it has more than one use
      // if options are defined:
    } else if (options !== null) {
      // if player wants to play power as cash
      if (options.playAsCash) {
        this.money.push(card);
        // if power does not require request function:
      } else if (!card.card.confirm) {
        card.card.power(this, game, options);
        // if power requires confirmation from target player:
      } else {
        this.loadedPower = {
          pwr: card.card.power,
          opts: [this, game, options],
        };
        this.waitAccept = true;
        const victim = game.getPlayerByRelPosition(
          this.position,
          options.victim
        );
        victim.getConsent(card.name);
        return;
      }
      // else we need to get options from user:
    } else {
      // requests options before finishing move:
      this.getOptions(card);
      return;
    }
    this.finishMove();
  };

  /*
      OBJECT MANIPULATION:
  */

  // self-explanatory
  // TODO - return error on invalid id
  this.popHandCardById = function (id) {
    for (let c = 0; c < this.hand.length; c++) {
      if (this.hand[c].id === id) {
        return this.hand.splice(c, 1);
      }
    }
  };

  // TODO - return error on invalid id
  this.popPropCardById = function (id) {
    for (let s = 0; s < this.property.length; s++) {
      const street = this.property[s];
      for (let c = 0; c < street.length; c++) {
        const card = street[c];
        if (street[c].id == id) {
          return street.splice(c, 1);
        }
      }
    }
  };

  this.popMoneyCardById = function (id) {
    for (let c = 0; c < this.money.length; c++) {
      if (this.money[c].id === id) {
        return this.money.splice(c, 1);
      }
    }
  };

  this.popCardById = function (id) {
    let card = this.popPropCardById(id);
    if (card === "undefined") {
      return this.popMoneyCardById(id);
    } else {
      return card;
    }
  };

  this.reArrangeCash = function (game) {
    //TODO
  };

  this.reArrangeProperty = function (game) {
    //TODO
  };

  /*
      ACTIONS ON OTHER PLAYERS
  */

  // charges all other players a set amount
  this.chargeOthers = function (amount, game) {
    this.waitAccept = true;
    for (let p = 0; p < game.players.length; p++) {
      const player = game.players[p];
      if (player.id !== this.id) {
        player.giveMoney(amount, this);
      }
    }
  };

  // charges another player a set amount
  this.chargeOther = function (amount, player) {
    this.waitAccept = true;
    player.giveMoney(amount, this);
  };

  /*
      MISC?
  */

  // put card into property / cash pile depending on type
  this.takeCard = function (card) {
    if (card.cardType.slice(0, 4) === "prop") {
      this.addCardToProp(card);
    } else {
      this.money.push(card);
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

  this.drawCards = function (deck, amount) {
    for (let i = 0; i < amount; i++) {
      this.hand.push(deck.drawCard());
    }
  };

  /*
      EMITS
  */

  //
  this.giveMoney = function (amount) {
    this.moneyOwes += amount;
    this.socket.emit("payRequest", amount);
  };

  this.getOptions = function (card) {
    this.socket.emit("getOptions", card.Type);
  };

  // get consent before accepting steal etc. (gives opotunity for just say no)
  this.getConsent = function (game, player, card, options) {
    this.socket.emit("acceptRequest", card.name);
  };

  // send all game data to client
  this.sendAllGameData = function (game) {
    // gets data from other players relative to this player position
    var playerData = [];
    // inserts user player at position[0]
    playerData.push(this.getPrivateData());
    var relPos = game.positionRelative(game.players.length, this.position);
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
      "test_game_data" + this.id + ".json",
      JSON.stringify(gameData, null, 2),
      function () {
        console.log("JSON game data file written");
      }
    );
  };

  // checks if hand has more cards than allowed
  this.checkHandTooBig = function (game) {
    const excessCards = this.hand.length - game.maxHandCards;
    if (excessCards > 0) {
      this.socket.emit("forceDiscard", excessCards);
    } else {
      this.finishMove();
    }
  };

  /* 
      OBJECT DATA REQUESTS, UTILITIES
  */

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

  //self explanatory
  this.hasJustSayNo = function () {
    for (let c = 0; c < this.hand.length; c++) {
      if (this.hand[c].cardType === "justSayNo") {
        return true;
      }
    }
    return false;
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
}

module.exports = Player;
