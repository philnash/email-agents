import { collections } from "../utils/astra.js";

const users = collections.users;
await users.deleteMany({});
