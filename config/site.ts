export type SiteConfig = typeof siteConfig;

export interface Page {
  label: string;
  href?: string;
  navItems?: Omit<Page, "showInNavItems" | "showInNavMenuItems">[];
  showInNavItems: boolean;
  showInNavMenuItems: boolean;
}

export const pages: Page[] = [
  {
    label: "Transactions",
    href: "/",
    showInNavItems: true,
    showInNavMenuItems: true,
  },
  {
    label: "Config Recurring Expenses",
    href: "/recurring-expenses",
    showInNavItems: false,
    showInNavMenuItems: true,
  },
  {
    label: "Manage Recurring Expenses",
    href: "/recurring-expenses/management",
    showInNavItems: false,
    showInNavMenuItems: true,
  },
  {
    label: "Recurring Expenses",
    showInNavItems: true,
    showInNavMenuItems: false,
    navItems: [
      {
        label: "Configuration",
        href: "/recurring-expenses",
      },
      {
        label: "Management",
        href: "/recurring-expenses/management",
      },
    ],
  },
];

export const siteConfig = {
  name: "AI Money Tracker (v1.2)",
  description: "Make beautiful websites regardless of your design experience.",
  placeholders: [
    "Ingreso por salario de 2000, C1408",
    "Transferencia de C1408 a C2163 por 5000",
    "Gasolina del carro por 3000, C2163",
    "Retiro en cajero por 4000, C1408",
  ],
  navItems: pages.filter((page) => page.showInNavItems),
  navMenuItems: pages.filter((page) => page.showInNavMenuItems),
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
