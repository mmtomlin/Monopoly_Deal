
// Street prototype
function Street(card, game) {
  this.cards = [card];
  this.colour = card.card.colour;
  this.streetID = game.streetCounter;
  game.streetCounter++;

  // Rent amounts:
  const RENTS = {
    any: [0],
    brown: [1, 2],
    dblue: [3, 8],
    green: [2, 4, 7],
    lblue: [1, 2, 3],
    orange: [1, 3, 5],
    pink: [1, 2, 4],
    rail: [1, 2, 3, 4],
    red: [2, 3, 6],
    utility: [1, 2],
    yellow: [2, 4, 6],
  };

  this.isComplete = function () {
    if (this.cards.length >= RENTS[this.colour].length) {
      return true;
    } else {
      return false;
    }
  };

  this.getRentAmount = function () {
    if (this.isComplete()) {
      return RENTS[this.colour][RENTS[this.colour].length - 1];
    } else {
      return RENTS[this.colour][this.cards.length - 1];
    }
  };
}

module.exports = Street;