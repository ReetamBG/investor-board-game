const resultCards = [
  {
    id: "result_001",
    title: "Big Success",
    description:
      "Big success is where your investment leaps beyond growth and multiplies. What you put in comes back 3x, driven by bold decisions and strong momentum.",
    effectType: "multiply_investment",
    effectValue: 3,
    effectUnit: "multiplier",
    appliesTo: "corresponding_startup",
    cashEffect: "investment * 3",
  },
  {
    id: "result_002",
    title: "Success",
    description:
      "Success is where your investment grows with purpose and returns stronger. What you put in comes back 2x, driven by smart decisions and momentum.",
    effectType: "multiply_investment",
    effectValue: 2,
    effectUnit: "multiplier",
    appliesTo: "corresponding_startup",
    cashEffect: "investment * 2",
  },
  {
    id: "result_003",
    title: "Break Even",
    description:
      "The startup neither gains nor loses value. Your original investment is returned.",
    effectType: "return_investment",
    effectValue: 1,
    effectUnit: "multiplier",
    appliesTo: "corresponding_startup",
    cashEffect: "investment * 1",
  },
  {
    id: "result_004",
    title: "Fail",
    description: "The startup fails and the investment is lost.",
    effectType: "lose_investment",
    effectValue: 0,
    effectUnit: "multiplier",
    appliesTo: "corresponding_startup",
    cashEffect: "investment * 0",
  },
];

export default resultCards;
