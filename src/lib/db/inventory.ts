import type { Prisma } from "@prisma/client";

/**
 * Ensures RoomInventory records exist for the specified dates.
 * If they don't exist, they are created with the provided totalUnits.
 */
export async function ensureInventory(
  roomId: string,
  dates: Date[],
  totalUnits: number,
  tx: Prisma.TransactionClient
) {
  for (const date of dates) {
    await tx.roomInventory.upsert({
      where: {
        roomId_date: { roomId, date },
      },
      update: {},
      create: {
        roomId,
        date,
        totalUnits,
      },
    });
  }
}

/**
 * Checks if a room has availability across a date range.
 * Returns true if availableUnits > 0 for all dates.
 */
export async function checkAvailability(
  roomId: string,
  dates: Date[],
  tx: Prisma.TransactionClient
): Promise<boolean> {
  const inventories = await tx.roomInventory.findMany({
    where: {
      roomId,
      date: { in: dates },
    },
  });

  if (inventories.length !== dates.length) {
    return false; // Not all dates have inventory records yet
  }

  return inventories.every((inv) => {
    const available = inv.totalUnits - inv.bookedUnits - inv.lockedUnits;
    return available > 0;
  });
}

/**
 * Locks inventory using optimistic concurrency control.
 * Throws an error if the lock cannot be acquired (e.g. concurrent booking).
 */
export async function lockInventory(
  bookingId: string,
  roomId: string,
  dates: Date[],
  expiresAt: Date,
  tx: Prisma.TransactionClient
) {
  for (const date of dates) {
    // 1. Fetch current version
    const inv = await tx.roomInventory.findUniqueOrThrow({
      where: { roomId_date: { roomId, date } },
    });

    const available = inv.totalUnits - inv.bookedUnits - inv.lockedUnits;
    if (available <= 0) {
      throw new Error(`No availability for ${roomId} on ${date.toISOString()}`);
    }

    // 2. Optimistic update (only update if version hasn't changed)
    const updated = await tx.roomInventory.updateMany({
      where: {
        id: inv.id,
        version: inv.version,
      },
      data: {
        lockedUnits: { increment: 1 },
        version: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new Error("Concurrent modification detected. Please try again.");
    }

    // 3. Create the lock record
    await tx.roomLock.create({
      data: {
        bookingId,
        roomInventoryId: inv.id,
        expiresAt,
        status: "ACTIVE",
      },
    });
  }
}

/**
 * Releases locks associated with a booking (e.g. expired or cancelled).
 */
export async function releaseInventory(
  bookingId: string,
  tx: Prisma.TransactionClient
) {
  const locks = await tx.roomLock.findMany({
    where: {
      bookingId,
      status: "ACTIVE",
    },
  });

  for (const lock of locks) {
    // 1. Decrement lockedUnits
    await tx.roomInventory.update({
      where: { id: lock.roomInventoryId },
      data: {
        lockedUnits: { decrement: 1 },
      },
    });

    // 2. Update lock status
    await tx.roomLock.update({
      where: { id: lock.id },
      data: { status: "RELEASED" },
    });
  }
}

/**
 * Releases booked inventory for a confirmed booking (e.g. cancellation).
 * Unlike releaseInventory which handles ACTIVE (locked) units,
 * this handles CONVERTED locks from confirmed bookings — it decrements
 * bookedUnits instead of lockedUnits.
 */
export async function releaseBookedInventory(
  bookingId: string,
  tx: Prisma.TransactionClient
) {
  const locks = await tx.roomLock.findMany({
    where: {
      bookingId,
      status: "CONVERTED",
    },
  });

  for (const lock of locks) {
    await tx.roomInventory.update({
      where: { id: lock.roomInventoryId },
      data: {
        bookedUnits: { decrement: 1 },
      },
    });

    await tx.roomLock.update({
      where: { id: lock.id },
      data: { status: "RELEASED" },
    });
  }
}

/**
 * Confirms inventory for a booking (e.g. payment successful).
 * Converts locked units to booked units.
 */
export async function confirmInventory(
  bookingId: string,
  tx: Prisma.TransactionClient
) {
  const locks = await tx.roomLock.findMany({
    where: {
      bookingId,
      status: { in: ["ACTIVE", "RELEASED"] },
    },
  });

  for (const lock of locks) {
    if (lock.status === "ACTIVE") {
      await tx.roomInventory.update({
        where: { id: lock.roomInventoryId },
        data: {
          lockedUnits: { decrement: 1 },
          bookedUnits: { increment: 1 },
        },
      });
    } else {
      const inventory = await tx.roomInventory.findUniqueOrThrow({
        where: { id: lock.roomInventoryId },
      });
      const available =
        inventory.totalUnits - inventory.bookedUnits - inventory.lockedUnits;

      if (available <= 0) {
        throw new Error(
          `No availability to restore paid booking ${bookingId}`
        );
      }

      await tx.roomInventory.update({
        where: { id: lock.roomInventoryId },
        data: {
          bookedUnits: { increment: 1 },
        },
      });
    }

    await tx.roomLock.update({
      where: { id: lock.id },
      data: { status: "CONVERTED" },
    });
  }
}
