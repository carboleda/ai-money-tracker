import "./functions";
import { NextResponse } from "next/server";
import { apiEventBus, EventTypes } from "../event-bus";

export async function POST() {
  apiEventBus.emit(EventTypes.TRANSACTION_CREATED, {
    amount: 20000,
    category: "Salud",
    description: "Plan complementario Nueva EPS",
    id: "PYBnp4OvOlAUV43f1Zi5",
    notes: "96818",
    paymentLink:
      "https://www.psepagos.co/PSEHostingUI/ShowTicketOffice.aspx?ID=3483",
    sourceAccount: "C1408",
    status: "complete",
    type: "income",
  });
  return NextResponse.json({ message: "Hello" });
}

export async function DELETE() {
  apiEventBus.emit(EventTypes.TRANSACTION_CREATED, {
    amount: 10000,
    category: "Salud",
    description: "Plan complementario Nueva EPS",
    id: "PYBnp4OvOlAUV43f1Zi5",
    notes: "96818",
    paymentLink:
      "https://www.psepagos.co/PSEHostingUI/ShowTicketOffice.aspx?ID=3483",
    sourceAccount: "C1408",
    status: "complete",
    type: "expense",
  });
  return NextResponse.json({ message: "Hello" });
}
