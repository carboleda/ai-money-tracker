import { Link } from "@heroui/link";

import { siteConfig } from "@/config/site";

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
  if (!cookies()) {
    return null;
  }

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
      <div className="flex flex-row justify-between items-end w-full">
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
