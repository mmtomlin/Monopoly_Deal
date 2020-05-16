const Card = require(__dirname + "/card.js")
const cards = require(__dirname + "/cards.js")



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
    "justSayNo",
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

  // returns drawn card,
  // if deck is empty flips over discard pile
  this.drawCard = function () {
    if (this.cards.length < 1) {
      this.cards = this.discarded;
      this.discarded = [];
    }
    return this.cards.pop()
  }
}

module.exports = Deck;