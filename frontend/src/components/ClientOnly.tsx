"use client";

import dynamic from "next/dynamic";

const FeatureBenefitSection = dynamic(() => import("@/components/FeatureBenefitSection"), { ssr: false });

export default function ClientOnly() {
  return <FeatureBenefitSection />;
}
