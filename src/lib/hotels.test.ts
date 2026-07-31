import assert from "node:assert/strict";
import test from "node:test";
import { findRoomById, getHotel, hotels } from "./hotels";

test("Des Indes exposes only three bookable room types", () => {
  assert.equal(hotels.length, 1);
  assert.equal(hotels[0].id, "des-indes");
  assert.equal(hotels[0].name, "Des Indes");
  assert.equal(hotels[0].currency, "IDR");
  assert.deepEqual(
    hotels[0].rooms.map(({ id }) => id),
    ["deluxe", "premium", "presidential"],
  );
  assert.equal(getHotel("des-indes"), hotels[0]);
  assert.equal(findRoomById("premium")?.room.name, "Premium");
});
