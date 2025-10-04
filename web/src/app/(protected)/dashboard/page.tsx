"use client";

import type { SearchParams } from "nuqs";

interface Props {
  searchParams: Promise<SearchParams>;
}

export default function DashboardPage({ searchParams }: Props) {
  return <>DASHBOARD</>;
}
