
// Card prototype
function Card(cardType, creatorObject, id) {
  this.card = creatorObject;
  this.id = id;
  this.cardType = cardType;
  this.flipped = false;

  if (this.cardType === "rent") {
    this.card.power = getRent;
    this.card.value = 1;
  }

  // options object = {playAsCash: (true/false), colourPlayed: (colour) }
  getRent = function (game, player, options) {
    var rentAmount = player.getRentAmountByColour(options.colourPlayed) * player.rentMultiplier;
    player.chargeOthers(rentAmount, game);
    player.rentMultiplier = 1;
  }

  // function to change colour of prop wildcards
  this.flip = function () {
    if (this.card.reverseColour !== undefined) {
      const tempColour = this.card.reverseColour;
      this.card.reverseColour = this.card.colour;
      this.card.colour = tempColour;
      this.flipped = !this.flipped;
    }
  };
}

module.exports = Card;