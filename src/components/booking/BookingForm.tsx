"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { TabContent, TabHandler } from "@/components/ui/TabContent";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { DatePicker } from "@/components/ui/SingleDatePicker";
import {
  PiBedDuotone,
  PiBuildingApartmentDuotone,
  PiDoorOpenDuotone,
} from "react-icons/pi";

import { addDays, todayISO } from "@/lib/pricing";
import { TotalGuest } from "../ui/TotalGuest";

export default function BookingForm() {
  const t = useTranslations("home");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // Hooks for total guest
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  // Venue tab
  const [venueDate, setVenueDate] = useState("");

  // Default dates are set on the client only, to avoid a hydration mismatch.
  useEffect(() => {
    const today = todayISO();
    setCheckIn(addDays(today, 7));
    setCheckOut(addDays(today, 9));
  }, []);

  return (
    <>
      <div className="card flex flex-col gap-4 p-6 bg-base-100 h-80 max-h-96 shadow-md">
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
              rooms={rooms}
              adults={adults}
              children={children}
              onChange={(r, a, c) => {
                setRooms(r);
                setAdults(a);
                setChildren(c);
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
        <Button variant="primary" size="lg" className="w-full">
          <PiDoorOpenDuotone className="mr-2 h-5 w-5" />
          {t("booking.search")}
        </Button>
      </div>
    </>
  );
}
