import { IconType } from "react-icons";
import { HiCollection } from "react-icons/hi";
import { HiMiniArrowPathRoundedSquare, HiChartPie } from "react-icons/hi2";
import { MdPending, MdAccountBalance } from "react-icons/md";

export type SiteConfig = typeof siteConfig;

export interface Page {
  label: string;
  icon: IconType;
  href?: string;
  className?: string;
}

export type PageGroup = {
  groupLabel: string;
  pages: Page[];
};

export const pages: (Page | PageGroup)[] = [
  {
    label: "transactions",
    href: "/private",
    icon: HiCollection,
    className: "bg-secondary/10 text-secondary",
  },
  {
    label: "pending",
    href: "/private/recurring-expenses/management",
    icon: MdPending,
    className: "bg-warning/10 text-warning",
  },
  {
    label: "summary",
    href: "/private/summary",
    icon: HiChartPie,
    className: "bg-primary/10 text-primary",
  },
  {
    groupLabel: "settings",
    pages: [
      {
        label: "recurrent",
        href: "/private/recurring-expenses",
        icon: HiMiniArrowPathRoundedSquare,
        className: "bg-info/10 text-info",
      },
      {
        label: "accounts",
        href: "/private/accounts",
        icon: MdAccountBalance,
        className: "bg-success/10 text-success",
      },
    ],
  },
];

export const siteConfig = {
  name: "Zolvent",
  description: "Make beautiful websites regardless of your design experience.",
  placeholders: [
    "Ingreso por salario de 2000, C1408",
    "Transferencia de C1408 a C2163 por 5000",
    "Gasolina del carro por 3000, C2163",
    "Retiro en cajero por 4000, C1408",
  ],
  pages,
  links: {
    github: "https://github.com/carboleda/ai-money-tracker",
    twitter: "https://twitter.com/cfarboleda",
    linkedin: "https://www.linkedin.com/in/carboleda/",
    sponsor: "https://carlosarboleda.co/",
  },
  icons: {
    icon: "/favicon/favicon.ico",
    logo: "/zolvent.svg",
    shortcut: "/favicon/favicon-16x16.png",
    apple: "/favicon/apple-touch-icon.png",
  },
};
