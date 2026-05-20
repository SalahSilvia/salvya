import type { ComponentType, ReactNode } from "react";

export type SalvyaDomain = "store" | "creator" | "admin";

export type DomainShellProps = { children: ReactNode };

export type StoreDomainExports = {
  StoreDomainShell: ComponentType<DomainShellProps>;
};

export type CreatorDomainExports = {
  CreatorDomainShell: ComponentType<DomainShellProps>;
};

export type AdminDomainExports = {
  AdminDomainShell: ComponentType<DomainShellProps>;
};
