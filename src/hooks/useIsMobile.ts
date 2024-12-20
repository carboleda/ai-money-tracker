/**
 * https://unpkg.com/browse/@nextui-org/use-is-mobile@2.0.9/dist/index.mjs
 */
import { useIsSSR } from "@react-aria/ssr";

const MOBILE_SCREEN_WIDTH = 700;

export const useIsMobile = () => {
  let isSSR = useIsSSR();
  if (isSSR || typeof window === "undefined") {
    return false;
  }
  return window.screen.width <= MOBILE_SCREEN_WIDTH;
};
