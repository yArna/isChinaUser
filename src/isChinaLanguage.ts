/** @param [options.strict] - 首选语言是中文才判断是中文语言
 *  @param [options.simplified] - 仅判断简体中文
 */
export function isChinaLanguage(options?: {
  strict?: boolean;
  onlySimplified?: boolean;
}) {
  const navigatorLanguage =
    navigator.language || (navigator as any).userLanguage || "en";

  const languages = navigator.languages || [navigatorLanguage];

  const isChinese = (lang: string): boolean => {
    if (options?.onlySimplified) {
      return /^zh(-CN|-Hans)?$/i.test(lang);
    } else {
      return /^zh/i.test(lang);
    }
  };

  if (options?.strict) {
    return isChinese(languages[0]);
  } else {
    return languages.some(isChinese);
  }
}
