import { Link } from "@nextui-org/link";
import { Image } from "@nextui-org/image";

import { siteConfig } from "@/config/site";
import NextLink from "next/link";

import { ThemeSwitch } from "@/components/shared/ThemeSwitch";
import {
  TwitterIcon,
  GithubIcon,
  IconLinkedin,
} from "@/components/shared/icons";
import { getTokens } from "next-firebase-auth-edge";
import { cookies } from "next/headers";
import { Env } from "@/config/env";
import { UserAvatar } from "../UserAvatar";

export const Navbar = async () => {
  const tokens = await getTokens(cookies(), {
    apiKey: Env.FIREBASE_SERVICE_ACCOUNT.apiKey,
    cookieName: "AuthToken",
    cookieSignatureKeys: Env.AUTH_COOKIE_SIGNATURE_KEYS,
    serviceAccount: Env.NEXT_PUBLIC_FIREBASE_APP_CONFIG as any,
  });

  if (!tokens) {
    return null;
  }

  return (
    <div className="flex flex-col w-full gap-4 justify-between items-center mt-3">
      <div className="flex flex-row justify-between items-center w-full">
        <div className="flex w-full">
          <NextLink className="flex justify-start items-center gap-3" href="/">
            <Image width={40} alt="App logo" src={siteConfig.icons.logo} />
            <p className="font-bold text-inherit text-lg text-zinc-700 dark:text-zinc-200">
              {siteConfig.name}
            </p>
          </NextLink>
        </div>

        <div className="hidden sm:flex basis-1/5 sm:basis-full justify-end gap-2">
          <div className="hidden sm:flex gap-2">
            <Link
              isExternal
              href={siteConfig.links.twitter}
              aria-label="Twitter"
            >
              <TwitterIcon className="text-default-500" />
            </Link>
            <Link
              isExternal
              href={siteConfig.links.linkedin}
              aria-label="LinkedIn"
            >
              <IconLinkedin className="text-default-500" />
            </Link>
            <Link isExternal href={siteConfig.links.github} aria-label="Github">
              <GithubIcon className="text-default-500" />
            </Link>
            <ThemeSwitch />
          </div>
          <div className="hidden md:flex">
            <UserAvatar user={tokens?.decodedToken} />
          </div>
        </div>

        <div className="flex items-center sm:hidden pl-4 justify-end gap-2">
          <ThemeSwitch />
          <UserAvatar user={tokens?.decodedToken} />
        </div>
      </div>
    </div>
  );
};
