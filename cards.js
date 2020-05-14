//card powers
dealBreaker = function (game, player) {
  console.log("deal breaker played");
};
debtCollector = function (game, player) {
  console.log("debt collector played");
};
doubleTheRent = function (game, player) {
  console.log("double the rent played");
};
forcedDeal = function (geme, player) {
  console.log("forced deal played");
};
itsMyBirthday = function (game, player) {
  console.log("it's my birthday played");
};
slyDeal = function (game, player) {
  console.log("sly deal played");
};
passGo = function (game, player) {
  console.log("pass go played");
};
justSayNo = function (game, player) {
  console.log("jut say no played");
};

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
      colour: "purple",
      numberof: 3,
      value: 2,
      name: "prop-purple-",
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
      reverseColour: "purple",
      name: "prop-wc-orange-purple",
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
      value: 4,
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
      value: 4,
      numberof: 3,
      rent: 4,
    },
    {
      colour: "any",
      name: "hotel",
      value: 3,
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
      rentColours: ["dblue", "green"],
      numberof: 2,
      name: "rent-dblue-green",
    },
    {
      rentColours: ["brown", "lblue"],
      numberof: 2,
      rent: "rent-brown-lblue",
    },
    {
      rentColours: ["purple", "orange"],
      numberof: 2,
      name: "rent-purple-orange",
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
  rentAny: [
    {
      power: rentAny,
      value: 3,
      numberof: 3,
      name: "rent-any",
    },
  ],
  power: [
    {
      name: "just-say-no",
      power: justSayNo,
      value: 4,
      numberof: 3,
    },
    {
      name: "deal-breaker",
      power: dealBreaker,
      value: 5,
      numberof: 2,
    },
    {
      name: "debt-collector",
      power: debtCollector,
      value: 3,
      numberof: 3,
    },
    {
      name: "double-the-rent",
      power: doubleTheRent,
      value: 1,
      numberof: 1,
    },
    {
      name: "forced-deal",
      power: forcedDeal,
      value: 3,
      numberof: 3,
    },
    {
      name: "its-my-birthday",
      power: itsMyBirthday,
      value: 2,
      numberof: 3,
    },
    {
      name: "sly-deal",
      power: slyDeal,
      value: 3,
      numberof: 3,
    },
    {
      name: "pass-go",
      power: passGo,
      value: 1,
      numberof: 10,
    },
  ],
};
