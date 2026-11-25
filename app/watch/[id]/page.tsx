import { PRODUCTS } from "../../types";
import WatchDetailClient from "./WatchDetailClient";

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    id: product.id,
  }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function WatchPage({ params }: PageProps) {
  const { id } = await params;
  return <WatchDetailClient productId={id} />;
}