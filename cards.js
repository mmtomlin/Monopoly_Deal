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
    },
  ],
  propWC : [
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
    },
  ],
  propAny: [
    {
      colour: "any",
      numberof: 2,
      value: 0,
    },
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
    },
  ],
  rent: [
    {
      RentColours: "any",
      numberof: 3,
    },
    {
      rentColours : ["dblue", "green"],
      numberof: 2,
    },
    {
      rentColours: ["brown", "lblue"],
      numberof: 2,
    },
    {
      rentColours: ["purple", "orange"],
      numberof: 2,
    },
    {
      rentColours: ["rail", "utility"],
      numberof: 2,
    },
    {
      rentColours: ["red", "yellow"],
      numberof: 2,
    },
  ],
  power: [
    {
      power: "dealBreaker",
      value: 5,
      numberof: 2,
    },
    {
      power: "debtCollector",
      value: 3,
      numberof: 3,
    },
    {
      power: "doubleTheRent",
      value: 1,
      numberof: 1,
    },
    {
      power: "forcedDeal",
      value: 3,
      numberof: 3,
    },
    {
      power: "justSayNo",
      value: 4,
      numberof: 3,
    },
    {
      power: "itsMyBirthday",
      value: 2,
      numberof: 3,
    },
    {
      power: "slyDeal",
      value: 3,
      numberof: 3,
    },
    {
      power: "passGo",
      value: 1,
      numberof: 10,
    },
    {
      power: "hotel",
      value: 4,
      numberof: 3,
    },
    {
      power: "house",
      value: 3,
      numberof: 3,
    },
  ],
};
