"use client";

import { authClient } from "~/lib/auth-client";

interface Props {
  children: React.ReactNode;
}

export function NoSpaceSelected({ children }: Props) {
  const { data: activeSpace } = authClient.useActiveOrganization();

  if (!activeSpace) {
    return children;
  }

  return null;
}

export function SpaceSelected({ children }: Props) {
  const { data: activeSpace } = authClient.useActiveOrganization();

  if (activeSpace) {
    return children;
  }

  return null;
}
