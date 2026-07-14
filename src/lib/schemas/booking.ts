import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */



/* ------------------------------------------------------------------ */
/*  ISO date string custom type                                        */
/* ------------------------------------------------------------------ */

const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format")
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date");

/* ------------------------------------------------------------------ */
/*  Booking request schema                                             */
/* ------------------------------------------------------------------ */

export const BookingRequestSchema = z
  .object({
    room_id: z.string().min(1, "room_id is required"),

    check_in_date: isoDateString,
    check_out_date: isoDateString,

    guests: z
      .number({
        error: (issue) =>
          issue.input === undefined
            ? "guests is required"
            : "guests must be a number",
      })
      .int("guests must be an integer")
      .min(1, "guests must be at least 1"),

    guest_first_name: z
      .string()
      .min(1, "guest_first_name is required")
      .transform((s) => s.trim()),
    guest_last_name: z
      .string()
      .min(1, "guest_last_name is required")
      .transform((s) => s.trim()),
    guest_email: z.string().email("A valid guest_email is required"),
    guest_phone: z
      .string()
      .optional()
      .transform((s) => s?.trim() || undefined),


  })
  .strict();

/** Inferred TypeScript type from the schema (after transforms) */
export type BookingRequest = z.infer<typeof BookingRequestSchema>;

/* ------------------------------------------------------------------ */
/*  Zod error → API error format mapper                                */
/* ------------------------------------------------------------------ */

export interface ApiValidationError {
  field: string;
  code: string;
  message: string;
}

/**
 * Convert a ZodError into the API's `errors[]` format, matching the
 * existing API contract structure.
 */
export function formatZodErrors(
  error: z.ZodError
): ApiValidationError[] {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "_root",
    code: zodCodeToApiCode(issue),
    message: issue.message,
  }));
}

function zodCodeToApiCode(issue: z.ZodIssue): string {
  switch (issue.code) {
    case "invalid_type":
      return issue.input === undefined ? "REQUIRED" : "INVALID_TYPE";
    case "too_small":
      return "REQUIRED";
    case "invalid_format":
      return "INVALID_FORMAT";
    case "invalid_value":
      // Handles email validation and regex mismatches
      if (issue.message.includes("email")) return "INVALID_EMAIL";
      return "INVALID_FORMAT";
    case "custom":
      // Custom refinements (Luhn, expiry, etc.)
      if (issue.message.includes("Luhn")) return "INVALID_CARD";
      if (issue.message.includes("expired")) return "CARD_EXPIRED";
      return "INVALID_VALUE";
    case "unrecognized_keys":
      return "UNKNOWN_FIELD";
    default:
      return "INVALID_VALUE";
  }
}
