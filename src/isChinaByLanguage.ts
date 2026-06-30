/**
 * 通过语言设置判断是否是中国用户
 */
export function isChinaByLanguage(options?: {
  /**
   * 是否严格限制为仅中国大陆
   * @default false (默认包含台湾、香港、澳门)
   */
  mainland?: boolean;

  /**
   * 是否仅检查最高优先级的首选语言
   * 默认只要语言列表出现中文都算中文
   */
  strict?: boolean;
}) {
  const navigatorLanguage =
    navigator.language || (navigator as any).userLanguage || "en";

  const languages = navigator.languages || [navigatorLanguage];

  const isChinese = (lang: string): boolean => {
    if (options?.mainland) {
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
