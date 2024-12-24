export const fallbackLng = "en";
export const languages = [fallbackLng];
export const defaultNS = "common";
export const cookieName = "i18next";

export const getOptions = (lng = fallbackLng, ns = defaultNS) => {
  return {
    debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
};
