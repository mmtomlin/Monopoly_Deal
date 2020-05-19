
// Card prototype
function Card(cardType, creatorObject, id) {
  this.card = creatorObject;
  this.id = id;
  this.cardType = cardType;

  if (this.cardType === "rent") {
    this.card.power = {}
    this.card.power.power = getRent;
  }

  // options object = {playAsCash: (true/false), colourPlayed: (colour) }
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
}

module.exports = Card;