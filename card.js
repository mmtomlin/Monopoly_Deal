module.exports = Card;

// Card prototype
function Card(cardType, creatorObject, id) {
  this.card = creatorObject;
  this.card.id = id;
  this.cardType = cardType;

  if (this.cardType === "rent") {
    this.card.power = getRent;
  }

  getRent = function (player, game, options) {
    var rentAmount = player.getRentAmountByColour(options.colourPlayed) * player.rentMultiplier;
    player.chargeOthers(rentAmount);
    player.rentMultiplier = 1;
  }

  // function to change colour of prop wildcards
  this.flip = function () {
    if (this.reverse !== undefined) {
      var l = this.reverse;
      this.reverse = this.colour;
      this.colour = l;
    }
  };

  // not yet used
  this.isrent = function () {
    if (this.cardType === "rent") {
      return true;
    } else {
      return false;
    }
  };

  // not yet used
  this.hasValue = function () {
    if (typeof this.card.value === "number") {
      return true;
    } else {
      return false;
    }
  };
}
