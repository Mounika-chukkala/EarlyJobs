import { store } from "./store/index.js";

export async function seedDatabase(options) {
  return store().seed(options);
}
