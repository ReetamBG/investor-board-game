const eventCards = [
  {
    id: "event_001",
    title: "Startup Boom",
    description:
      "The startup boom is a rapid rise of new businesses driven by technology, funding, and bold ideas. While many fail, the successful ones grow fast and reshape industries.",
    effectType: "multiply_returns",
    effectValue: 2,
    effectUnit: "multiplier",
    appliesTo: "all_players",
    condition: "All returns are multiplied by 2x this cycle.",
  },
  {
    id: "event_002",
    title: "Bonus Funding",
    description:
      "Bonus Funding gives every player a head start with ₹1,000. More play, more possibilities, right from the beginning.",
    effectType: "add_cash",
    effectValue: 1000,
    effectUnit: "INR",
    appliesTo: "all_players",
    condition: "Every player receives ₹1,000.",
  },
  {
    id: "event_003",
    title: "Market Crash",
    description:
      "Market Crash hits everyone with a ₹1,000 loss. A sudden dip that tests strategy and resilience. Stay sharp, recover smart.",
    effectType: "reduce_cash",
    effectValue: 1000,
    effectUnit: "INR",
    appliesTo: "all_players",
    condition: "Every player loses ₹1,000.",
  },
];

export default eventCards;
