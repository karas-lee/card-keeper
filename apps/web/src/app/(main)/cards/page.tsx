import type { Metadata } from "next";
import { CardsPageContent } from "./cards-page-content";

export const metadata: Metadata = {
  title: "명함 목록",
};

export default function CardsPage() {
  return <CardsPageContent />;
}
