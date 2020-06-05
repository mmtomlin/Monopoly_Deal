//card powers

// options object = {playAsCash: (true/false), victim: (victim position), streetID: (street id)}
dealBreaker = function (game, player, options) {
    const streetID = options.streetID;
    const victim = game.getPlayerByRelPos(player, options.victim);
    player.property.push(victim.popStreetByID(streetID));
};
// options object = {playAsCash: (true/false), victim: (victim position) }
debtCollector = function (game, player, options) {
    const victim = game.getPlayerByRelPos(player, options.victim);
    const charge = 5;
    player.chargeOther(charge, victim, game);
};
// options object = {playAsCash: (true/false)}
doubleTheRent = function (game, player, options) {
    player.rentMultiplier = 2;
};
// options object = {playAsCash: (true/false), victim: (victim position), targetCardID, swapCardID } 
forcedDeal = function (game, player, options) {
    const victim = game.getPlayerByRelPos(player, options.victim);
    player.addCardToProp(victim.popPropCardByID(options.targetCardID), game);
    victim.addCardToProp(player.popPropCardByID(options.swapCardID), game);
    player.cleanStreets();
    victim.cleanStreets();
};
// options object = {playAsCash: (true/false) }
itsMyBirthday = function (game, player, options) {
    const charge = 2;
    player.chargeOthers(charge, game);
};
// options object = {playAsCash: (true/false), victim: (victim position), targetCardID}
slyDeal = function (game, player, options) {
    const victim = game.getPlayerByRelPos(player, options.victim);
    player.addCardToProp(victim.popPropCardByID(options.targetCardID), game);
};
// options object = {playAsCash: (true/false) }
passGo = function (game, player, options) {
    player.drawCards(game.deck, game.cardsPerTurn);
};
// options object = {playAsCash: (true/false), victim: (victim position), colourPlayed: (colour) }
rentAny = function (game, player, options) {
    const victim = game.getPlayerByRelPos(player, options.victim);
    const charge = player.getRentAmountByColour(options.colourPlayed) * player.rentMultiplier;
    player.rentMultiplier = 1;
    player.chargeOther(charge, victim, game);
}

exports.CARDS = {
  prop: [
    // Main property cards
    {
      colour: "brown",
      numberof: 2,
      value: 1,
      name: "prop-brown-",
    },
    {
      colour: "dblue",
      numberof: 2,
      value: 4,
      name: "prop-dblue-",
    },
    {
      colour: "green",
      numberof: 3,
      value: 4,
      name: "prop-green-",
    },
    {
      colour: "lblue",
      numberof: 3,
      value: 1,
      name: "prop-lblue-",
    },
    {
      colour: "orange",
      numberof: 3,
      value: 2,
      name: "prop-orange-",
    },
    {
      colour: "pink",
      numberof: 3,
      value: 2,
      name: "prop-pink-",
    },
    {
      colour: "rail",
      numberof: 4,
      value: 2,
      name: "prop-rail-",
    },
    {
      colour: "red",
      numberof: 3,
      value: 3,
      name: "prop-red-",
    },
    {
      colour: "utility",
      numberof: 2,
      value: 2,
      name: "prop-utility-",
    },
    {
      colour: "yellow",
      numberof: 3,
      value: 3,
      name: "prop-yellow-",
    },
  ],
  propWC: [
    // Wildcards
    {
      colour: "dblue",
      numberof: 1,
      value: 4,
      reverseColour: "green",
      name: "prop-wc-dblue-green",
    },
    {
      colour: "lblue",
      numberof: 1,
      value: 1,
      reverseColour: "brown",
      name: "prop-wc-lblue-brown",
    },
    {
      colour: "orange",
      numberof: 1,
      value: 2,
      reverseColour: "pink",
      name: "prop-wc-orange-pink",
    },
    {
      colour: "green",
      numberof: 1,
      value: 4,
      reverseColour: "rail",
      name: "prop-wc-green-rail",
    },
    {
      colour: "lblue",
      numberof: 1,
      value: 4,
      reverseColour: "rail",
      name: "prop-wc-lblue-rail",
    },
    {
      colour: "utility",
      numberof: 1,
      value: 2,
      reverseColour: "rail",
      name: "prop-wc-utility-rail",
    },
    {
      colour: "yellow",
      numberof: 1,
      value: 3,
      reverseColour: "red",
      name: "prop-wc-yellow-red",
    },
  ],
  propB: [
    {
      colour: "any",
      name: "house",
      value: 3,
      numberof: 3,
      rent: 4,
    },
    {
      colour: "any",
      name: "hotel",
      value: 4,
      numberof: 3,
      rent: 4,
    },
  ],
  propAny: [
    {
      colour: "any",
      numberof: 2,
      value: 0,
      name: "prop-any",
    },
  ],
  cash: [
    {
      value: 10,
      numberof: 1,
      name: "money-10",
    },
    {
      value: 5,
      numerof: 2,
      name: "money-5",
    },
    {
      value: 4,
      numberof: 3,
      name: "money-4",
    },
    {
      value: 3,
      numberof: 3,
      name: "money-3",
    },
    {
      value: 2,
      numberof: 5,
      name: "money-2",
    },
    {
      value: 1,
      numberof: 6,
      name: "money-1",
    },
  ],
  rent: [
    {
      rentColours: ["green", "dblue"],
      numberof: 2,
      name: "rent-green-dblue",
    },
    {
      rentColours: ["brown", "lblue"],
      numberof: 2,
      name: "rent-brown-lblue",
    },
    {
      rentColours: ["pink", "orange"],
      numberof: 2,
      name: "rent-pink-orange",
    },
    {
      rentColours: ["rail", "utility"],
      numberof: 2,
      name: "rent-rail-utility",
    },
    {
      rentColours: ["red", "yellow"],
      numberof: 2,
      name: "rent-red-yellow",
    },
  ],
  justSayNo: [
    {
      name: "just-say-no",
      value: 4,
      numberof: 3,
      confirm: true,
    },
  ],
  rentAny: [
    {
      power: rentAny,
      value: 3,
      numberof: 3,
      name: "rent-any",
      confirm: false,
    },
  ],
  power: [
    {
      name: "deal-breaker",
      power: dealBreaker,
      value: 5,
      numberof: 2,
      confirm: true,
    },
    {
      name: "debt-collector",
      power: debtCollector,
      value: 3,
      numberof: 3,
      confirm: false,
    },
    {
      name: "double-the-rent",
      power: doubleTheRent,
      value: 1,
      numberof: 1,
      confirm: false,
    },
    {
      name: "forced-deal",
      power: forcedDeal,
      value: 3,
      numberof: 3,
      confirm: true,
    },
    {
      name: "its-my-birthday",
      power: itsMyBirthday,
      value: 2,
      numberof: 3,
      confirm: false,
    },
    {
      name: "sly-deal",
      power: slyDeal,
      value: 3,
      numberof: 3,
      confirm: true,
    },
    {
      name: "pass-go",
      power: passGo,
      value: 1,
      numberof: 10,
      confirm: false,
    },
  ],
};
