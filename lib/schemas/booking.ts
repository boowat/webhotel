import { z } from "zod";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Luhn check — validates credit card numbers */
function luhnCheck(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

/** Check that a card expiry (MM/YY) is not in the past */
function isNotExpired(value: string): boolean {
  const [mm, yy] = value.split("/").map((v) => parseInt(v, 10));
  const expYear = 2000 + yy;
  const expMonth = mm;
  const today = new Date();
  return !(
    expYear < today.getFullYear() ||
    (expYear === today.getFullYear() && expMonth < today.getMonth() + 1)
  );
}

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

    card_number: z
      .string()
      .min(1, "card_number is required")
      .refine(luhnCheck, "card_number failed Luhn check"),
    card_expiry: z
      .string()
      .regex(/^[0-1][0-9]\/\d{2}$/, "card_expiry must be in MM/YY format")
      .refine(isNotExpired, "The card has expired"),
    card_cvc: z
      .string()
      .regex(/^[0-9]{3,4}$/, "card_cvc must be 3 or 4 digits"),
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
