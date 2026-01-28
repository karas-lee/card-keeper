import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  const locale = "ko"; // Default locale
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
