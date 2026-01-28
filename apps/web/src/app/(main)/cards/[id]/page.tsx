import type { Metadata } from "next";
import { CardDetailPageContent } from "./card-detail-page-content";

export const metadata: Metadata = {
  title: "명함 상세",
};

interface CardDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CardDetailPage({ params }: CardDetailPageProps) {
  const { id } = await params;
  return <CardDetailPageContent id={id} />;
}
