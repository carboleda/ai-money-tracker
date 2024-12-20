import { IconType } from "react-icons";
import { HiCollection } from "react-icons/hi";
import { HiMiniArrowPathRoundedSquare } from "react-icons/hi2";
import { HiBell } from "react-icons/hi";
import { HiChartPie } from "react-icons/hi2";

export type SiteConfig = typeof siteConfig;

export interface Page {
  label: string;
  href?: string;
  icon: IconType;
}

export const pages: Page[] = [
  {
    label: "transactions",
    href: "/",
    icon: HiCollection,
  },
  {
    label: "pending",
    href: "/recurring-expenses/management",
    icon: HiBell,
  },
  {
    label: "recurrent",
    href: "/recurring-expenses",
    icon: HiMiniArrowPathRoundedSquare,
  },
  {
    label: "summary",
    href: "/summary",
    icon: HiChartPie,
  },
];

export const siteConfig = {
  name: "AI Money Tracker",
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
    logo: "/favicon/favicon-48x48.png",
    shortcut: "/favicon/favicon-16x16.png",
    apple: "/favicon/apple-touch-icon.png",
  },
};
