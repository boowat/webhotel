import test from "node:test";
import assert from "node:assert/strict";

import { seedHotel } from "../prisma/seed-data";

test("seed data contains the three requested room types with 10 units each", () => {
  assert.deepEqual(
    seedHotel.rooms.map((room) => room.id),
    ["standard", "gold", "presidential"],
  );

  for (const room of seedHotel.rooms) {
    assert.equal(room.totalUnits, 10);
  }
});
