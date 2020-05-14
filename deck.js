const Card = require(__dirname + "/card.js")

module.exports = Deck;

// Deck prototype
function Deck() {
  this.cards = [];
  this.discarded = [];

  // Generate cards:
  cardTypes = [
    "prop",
    "propWC",
    "propAny",
    "cash",
    "rent",
    "rentAny",
    "power",
    "propB",
  ];

  //loop over card types
  for (let t = 0; t < cardTypes.length; t++) {
    const cardType = cardTypes[t];
    const cardGroup = cards.CARDS[cardType];
    // loop over cards
    for (let i = 0; i < cardGroup.length; i++) {
      const cardEntry = cardGroup[i];
      // loops if more than one of this same card
      for (let j = 0; j < cardEntry.numberof; j++) {
        var newCard = new Card(cardType, cardEntry, j);
        var name = cardEntry.name;
        var id = name + j;
        if (cardType === "prop") {
          name = name.concat(j + 1);
        }
        newCard.name = name;
        newCard.id = id;
        this.cards.push(newCard);
      }
    }
  }

  this.flipPile = function () {
    this.cards = this.discarded.reverse();
    this.discarded = [];
  };

  this.addToDiscard = function (card) {
    this.discarded.push(card);
  };
}