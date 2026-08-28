"use client";

import React from "react";
import { useParams } from "next/navigation";
import { VadamvaliGame } from "@/components/vadamvali/VadamvaliGame";

export default function VadamvaliPage() {
  const params = useParams<{ slug: string }>();
  return <VadamvaliGame eventSlug={params?.slug ?? "onam-2026"} />;
}
