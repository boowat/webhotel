"use client";
import type { FormEvent } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { TabContent, TabHandler } from "@/components/ui/TabContent";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { DatePicker } from "@/components/ui/SingleDatePicker";
import { addDays, nightsBetween, todayISO } from "@/lib/pricing";
import { TotalGuest } from "./TotalGuest";
import {
  PiBedDuotone,
  PiBuildingApartmentDuotone,
  PiDoorOpenDuotone,
} from "react-icons/pi";

export default function BookingForm() {
  const t = useTranslations("home");
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(() => addDays(todayISO(), 7));
  const [checkOut, setCheckOut] = useState(() => addDays(todayISO(), 9));

  // Hooks for total guest
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);

  // Venue tab
  const [venueDate, setVenueDate] = useState("");

  const datesValid = nightsBetween(checkIn, checkOut) > 0;

  function searchRooms(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!datesValid) return;

    const params = new URLSearchParams({
      checkIn,
      checkOut,
      rooms: String(rooms),
      adults: String(adults),
      children: String(childrenCount),
      guests: String(adults + childrenCount),
    });

    router.push(`/hotels/search?${params.toString()}`);
  }

  return (
    <>
      <form
        onSubmit={searchRooms}
        className="card flex flex-col gap-4 p-6 bg-base-100 h-80 max-h-96 shadow-md"
      >
        {/* name of each tab group should be unique */}

        <div className="tabs bg-base-100 grow">
          <TabHandler defaultChecked={true}>
            <PiBedDuotone className="mr-2 h-5 w-5" />
            {t("booking.rooms")}
          </TabHandler>
          {/* content for rooms tab */}
          <TabContent>
            <DateRangePicker
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={(ci, co) => {
                setCheckIn(ci);
                setCheckOut(co);
              }}
              placeholder={`${t("booking.checkIn")} — ${t("booking.checkOut")}`}
            />
            <TotalGuest
              label={t("booking.guests")}
              rooms={rooms}
              adults={adults}
              childrenCount={childrenCount}
              onChange={(r, a, c) => {
                setRooms(r);
                setAdults(a);
                setChildrenCount(c);
              }}
            />
          </TabContent>

          <TabHandler defaultChecked={false}>
            <PiBuildingApartmentDuotone className="mr-2 h-5 w-5" />
            {t("booking.venues")}
          </TabHandler>
          <TabContent>
            <DatePicker
              value={venueDate}
              onChange={setVenueDate}
              label={t("booking.venues")}
              placeholder={t("booking.date")}
            />
          </TabContent>
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={!datesValid}
        >
          <PiDoorOpenDuotone className="mr-2 h-5 w-5" />
          {t("booking.search")}
        </Button>
      </form>
    </>
  );
}
