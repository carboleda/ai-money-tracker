export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Next.js + NextUI",
  description: "Make beautiful websites regardless of your design experience.",
  placeholders: [
    "Ingreso por salario de 2000, C1408",
    "Transferencia de C1408 a C2163 por 5000",
    "Gasolina del carro por 3000, C2163",
    "Retiro en cajero por 4000, C1408",
  ],
  navItems: [
    {
      label: "Transactions",
      href: "/",
    },
  ],
  navMenuItems: [
    {
      label: "Transactions",
      href: "/",
    },
  ],
  links: {
    github: "https://github.com/carboleda/ai-money-tracker",
    twitter: "https://twitter.com/cfarboleda",
    linkedin: "https://www.linkedin.com/in/carboleda/",
    sponsor: "https://carlosarboleda.co/",
  },
};
