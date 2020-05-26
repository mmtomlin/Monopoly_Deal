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
    game.updateAllClients();
    this.continueTurn(game);
  };

  //
  this.continueTurn = function (game) {
    console.log("sending moveRequest");
    this.socket.emit("moveRequest", {
      movesRemaining: this.movesRemaining,
    });
  };

  this.finishTurn = function (game) {
    game.updateAllClients();
    if (!this.waitResponse && game.allDebtsPaid()) {
      if (!this.handTooBig(game)) {
        game.continue();
      }
    } else {
      this.socket.emit("moveRequest", {
        movesRemaining: 0,
      });
    }
  };

  // continue move, or start next players turn
  this.finishMove = function (game) {
    game.updateAllClients();
    // as long as player is not waiting for inputs:
    if (!this.waitResponse && game.allDebtsPaid()) {
      // if no moves left - end of turn
      if (this.movesRemaining !== 0) {
        this.continueTurn(game);
      }
    }
  };

  // plays a card out of the players hand
  this.playHandCard = function (id, game, options = null) {
    // get card
    let card = this.popHandCardByID(id);
    console.log("card played: " + card.id);
    this.movesRemaining--;
    // if card is cash, add to cash
    if (
      card.cardType === "cash" ||
      card.cardType === "justSayNo" ||
      options.playAsCash === true
    ) {
      console.log("cash card played");
      this.money.push(card);
      // if card is building, add to first full set
    } else if (card.cardType === "propB") {
      for (let s = 0; s < this.property.length; s++) {
        let street = this.property[s];
        if (street.isComplete()) {
          street.cards.push(card);
          this.finishMove(game);
          return;
        }
      }
      this.money.push(card);
      // if card is prop / propAny / propWC but not propB, add to property
    } else if (card.cardType.slice(0, 4) === "prop") {
      console.log("prop card played");
      this.addCardToProp(card, game);
      // if power does not require request function:
    } else if (!card.card.confirm) {
      card.card.power(game, this, options);
      // if power requires confirmation from target player:
    } else {
      this.loadedPower = {
        pwr: card.card.power,
        opts: [this, game, options],
      };
      this.waitResponse = true;
      const victim = game.getPlayerByRelPos(this, options.victim);
      victim.getConsent(card);
      return;
    }
    this.finishMove(game);
  };

  /*
      OBJECT MANIPULATION:
  */

  // self-explanatory
  // TODO - return error on invalid id
  this.popHandCardByID = function (id) {
    for (let c = 0; c < this.hand.length; c++) {
      if (this.hand[c].id === id) {
        return this.hand.splice(c, 1)[0];
      }
    }
    throw "card not found: " + id;
  };

  // TODO - return error on invalid id
  this.popPropCardByID = function (id) {
    for (let s = 0; s < this.property.length; s++) {
      const street = this.property[s];
      for (let c = 0; c < street.cards.length; c++) {
        const card = street.cards[c];
        if (card.id == id) {
          const card = street.cards.splice(c, 1)[0];
          if (street.cards.length === 0) this.property.splice(s, 0);
          return card;
        }
      }
    }
  };

  this.popMoneyCardByID = function (id) {
    for (let c = 0; c < this.money.length; c++) {
      if (this.money[c].id === id) {
        return this.money.splice(c, 1)[0];
      }
    }
  };

  this.popCardByID = function (id) {
    let card = this.popPropCardByID(id);
    if (typeof card === "undefined") {
      card = this.popMoneyCardByID(id);
    }
    if (typeof card === "undefined") {
      console.log("cannot find card " + id);
      console.log("property: " + JSON.stringify(this.property, null, 2));
      console.log("money: " + JSON.stringify(this.money, null, 2));
    }
    return card;
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
    for (let p = 0; p < game.players.length; p++) {
      const player = game.players[p];
      if (player.id !== this.id) {
        player.giveMoney(amount, game);
      }
    }
  };

  // charges another player a set amount
  this.chargeOther = function (amount, player) {
    player.giveMoney(amount, game);
  };

  /*
      MISC?
  */

  // put card into property / cash pile depending on type
  this.takeCard = function (card, game) {
    if (card.cardType.slice(0, 4) === "prop") {
      this.addCardToProp(card, game);
    } else {
      this.money.push(card);
    }
  };

  this.addCardToProp = function (card, game) {
    // if card is propAny add to first street
    if (card.cardType === "propAny") {
      if (this.property.length > 0) {
        this.property[0].cards.push(card);
      } else {
        this.property.push(new Street(card, game));
      }
      return;
    }
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
  this.giveMoney = function (amount, game) {
    // if player has no cards to give:
    if (this.property.length === 0 && this.money.length === 0) {
      this.moneyOwes = 0;
      if (game.allDebtsPaid()) {
        game.players[game.currentPlayer].finishMove(game);
      }
    } else {
      this.moneyOwes += amount;
      console.log("sending payRequest");
      this.socket.emit("payRequest", { amount: amount });
    }
  };

  //
  this.getOptions = function (card) {
    console.log("sending getOptions of " + card.id);
    this.socket.emit("getOptions", { card: card });
  };

  // get consent before accepting steal etc. (gives opotunity for just say no)
  this.getConsent = function (card) {
    let options = ["accept"];
    if (this.hasJustSayNo) options.push("just say no");
    console.log("sending acceptRequest");
    this.socket.emit("acceptRequest", { name: card.name, options: options });
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
      "debug/test_game_data" + this.id + ".json",
      JSON.stringify(gameData, null, 2),
      function () {}
    );
  };

  // checks if hand has more cards than allowed
  this.handTooBig = function (game) {
    const excessCards = this.hand.length - game.maxHandCards;
    if (excessCards > 0) {
      console.log("sending forceDiscard");
      this.socket.emit("forceDiscard", { excessCards: excessCards });
      return true;
    } else {
      return false;
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
    let property = this.property;
    for (let s = 0; s < property.length; s++) {
      let street = property[s];
      street.complete = street.isComplete();
    }
    return {
      name: this.name,
      property: property,
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
        if (rent > rentAmount) {
          rentAmount = rent;
        }
      }
    }
    return rentAmount;
  };
}

module.exports = Player;
