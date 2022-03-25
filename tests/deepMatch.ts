import { deepMatch } from "../src/helpers";

const sample = {
  filter: {
    wow: {
      dungeon: {
        type: 1,
      },
    },
  },
};
const obj = {
  filter: {
    wow: {
      dungeon: {
        aa: 23,
      },
    },
  },
};
console.log("Same", deepMatch(sample, obj));
