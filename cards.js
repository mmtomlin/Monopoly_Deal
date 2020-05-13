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
hotel = function (game, player) {}
house = function (game, player) {}

exports.CARDS = {
  prop: [
    // Main property cards
    {
      colour: "brown",
      numberof: 2,
      value: 1,
    },
    {
      colour: "dblue",
      numberof: 2,
      value: 4,
    },
    {
      colour: "green",
      numberof: 3,
      value: 4,
    },
    {
      colour: "lblue",
      numberof: 3,
      value: 1,
    },
    {
      colour: "orange",
      numberof: 3,
      value: 2,
    },
    {
      colour: "purple",
      numberof: 3,
      value: 2,
    },
    {
      colour: "rail",
      numberof: 4,
      value: 2,
    },
    {
      colour: "red",
      numberof: 3,
      value: 3,
    },
    {
      colour: "utility",
      numberof: 2,
      value: 2,
    },
    {
      colour: "yellow",
      numberof: 3,
      value: 3,
    }
  ],
  propWC: [
    // Wildcards
    {
      colour: "dblue",
      numberof: 1,
      value: 4,
      reverseColour: "green",
    },
    {
      colour: "lblue",
      numberof: 1,
      value: 1,
      reverseColour: "brown",
    },
    {
      colour: "orange",
      numberof: 1,
      value: 2,
      reverseColour: "purple",
    },
    {
      colour: "green",
      numberof: 1,
      value: 4,
      reverseColour: "rail",
    },
    {
      colour: "lblue",
      numberof: 1,
      value: 4,
      reverseColour: "rail",
    },
    {
      colour: "utility",
      numberof: 1,
      value: 4,
      reverseColour: "rail",
    },
    {
      colour: "yellow",
      numberof: 1,
      value: 3,
      reverseColour: "red",
    }
  ],
  propAny: [
    {
      colour: "any",
      numberof: 2,
      value: 0,
    }
  ],
  cash: [
    {
      value: 10,
      numberof: 1,
    },
    {
      value: 5,
      numerof: 2,
    },
    {
      value: 4,
      numberof: 3,
    },
    {
      value: 3,
      numberof: 3,
    },
    {
      value: 2,
      numberof: 5,
    },
    {
      value: 1,
      numberof: 6,
    }
  ],
  rentAny: [
    {
      value: 3,
      RentColours: "any",
      numberof: 3,
    }
  ],
  rent: [
    {
      value: 1,
      rentColours: ["dblue", "green"],
      numberof: 2,
    },
    {
      value: 1,
      rentColours: ["brown", "lblue"],
      numberof: 2,
    },
    {
      value: 1,
      rentColours: ["purple", "orange"],
      numberof: 2,
    },
    {
      value: 1,
      rentColours: ["rail", "utility"],
      numberof: 2,
    },
    {
      value: 1,
      rentColours: ["red", "yellow"],
      numberof: 2,
    }
  ],
  power: [
    {
      powerStr: "dealBreaker",
      power: dealBreaker,
      value: 5,
      numberof: 2,
    },
    {
      powerStr: "debtCollector",
      power: debtCollector,
      value: 3,
      numberof: 3,
    },
    {
      powerStr: "doubleTheRent",
      power: doubleTheRent,
      value: 1,
      numberof: 1,
    },
    {
      powerStr: "forcedDeal",
      power: forcedDeal,
      value: 3,
      numberof: 3,
    },
    {
      powerStr: "itsMyBirthday",
      power: itsMyBirthday,
      value: 2,
      numberof: 3,
    },
    {
      powerStr: "slyDeal",
      power: slyDeal,
      value: 3,
      numberof: 3,
    },
    {
      powerStr: "passGo",
      power: passGo,
      value: 1,
      numberof: 10,
    }
  ],
  building: [
    {
      building: "house",
      value: 4,
      numberof: 3,
    },
    {
      building: "hotel",
      value: 3,
      numberof: 3,
    }
  ]
};