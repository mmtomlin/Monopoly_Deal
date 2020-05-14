module.exports = Street;

// Street prototype
function Street(card) {
  this.cards = [card];
  this.colour = card.card.colour;

  // Rent amounts:
  const RENTS = {
    brown: [1, 2],
    dblue: [3, 8],
    green: [2, 4, 7],
    lblue: [1, 2, 3],
    orange: [1, 3, 5],
    purple: [1, 2, 4],
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

  this.getRent = function () {
    if (RENTS[this.colour].length < this.cards.length) {
      return RENTS[this.colour][this.cards.length];
    } else {
      return RENTS[this.colour][this.colour.length - 1];
    }
  };
}