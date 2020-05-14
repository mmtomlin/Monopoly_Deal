const fs = require("fs");

const Street = require(__dirname + "/street.js")

module.exports = Player;

// Player prototype
function Player(id, name, position) {
  this.name = name;
  this.socketID = id;
  this.hand = [];
  this.property = [];
  this.money = [];
  this.isReady = false;
  this.hasJustSayNo = false;
  this.position = position;
  this.move = { isTurn: false, movesRemaining: 0 };

  // player turn:
  this.startTurn = function () {
    this.move.movesRemaining = 3;
    io.to(this.socketID).emit("move", {
      movesRemaining: this.move.movesRemaining,
    });
  };

  // get private data for this player
  this.getPrivateData = function () {
    return {
      name: this.name,
      property: this.property,
      money: this.money,
      hand: this.hand,
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

    io.to(this.socketID).emit("gameData", gameData);
    fs.writeFile(
      "test_game_data.json",
      JSON.stringify(gameData, null, 2),
      function () {
        console.log("JSON game data file written");
      }
    );
  };

  // draws a card from deck into players hand
  this.giveHandCard = function (deck) {
    card = deck.cards.pop();
    this.hand.push(card);
    io.to(this.socketID).emit("pushHand", card);
  };

  // self-explanatory
  this.popHandCardById = function (id) {
    for (let c = 0; c < this.hand.length; c++) {
      if (this.hand[c].id === id) {
        return this.hand.splice(c, 1);
      }
    }
  };

  this.reArrangeCash = function () {
    //TODO
  };

  this.reArrangeProperty = function () {
    //TODO
  };

  // deals with a card picked by player as part of move
  // "options" added
  this.playHandCard = function (id, game, options = null) {
    for (let c = 0; c < this.cards.length; c++) {
      const card = this.cards[c];
      var actions = [];
      // double checks if card exists in hand
      if (card.id === id) {
        // if card is cash, add to cash
        if (card.cardType === "cash") {
          this.money.push(this.popHandCardById(id));
        // if card is prop / propAny / propWC, add to property
        } else if (card.cardType.slice(0, 4) === "prop") {
          this.addCardToProp(this.popHandCardById(id));
        // else the card needs options as it has more than one use
        // if options are defined:
        } else if (options !== null) {
        // trigger card power
          card.card.power(this, game, options);
        // else we need to get options from user:
        } else {
          card.getOptions(this);
        }
      }
    }
  };

  // checks if hand has more cards than allowed
  this.checkHandTooBig = function (game) {
    const excessCards = this.hand.cards.length - game.maxHandCards;
    if (excessCards > 0) {
      io.to(this.socketID).emit("forceDiscard", excessCards);
    }
  };

  this.addCardToProp = function (card) {
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
      this.property.push(new Street(card));
    }
  };
}

