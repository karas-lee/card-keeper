import type { Metadata } from "next";
import { NewCardPageContent } from "./new-card-page-content";

export const metadata: Metadata = {
  title: "새 명함 추가",
};

export default function NewCardPage() {
  return <NewCardPageContent />;
}
