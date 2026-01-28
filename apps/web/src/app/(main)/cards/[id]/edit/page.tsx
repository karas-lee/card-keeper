import type { Metadata } from "next";
import { EditCardPageContent } from "./edit-card-page-content";

export const metadata: Metadata = {
  title: "명함 수정",
};

interface EditCardPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCardPage({ params }: EditCardPageProps) {
  const { id } = await params;
  return <EditCardPageContent id={id} />;
}
