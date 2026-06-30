/**
 * 通过时区判断是否是中国用户
 */
export function isChinaByTimeZone(options?: {
  /**
   * 是否严格限制为仅中国大陆
   * @default false (默认包含台湾、香港、澳门)
   */
  mainland?: boolean;
}): boolean {
  const { mainland = false } = options ?? {};

  if (typeof Intl === "object" && typeof Intl.DateTimeFormat === "function") {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) {
      const mainlandTimeZones = [
        "Asia/Shanghai",
        "Asia/Chongqing",
        "Asia/Harbin",
        "Asia/Urumqi",
        "Asia/Beijing",
      ];

      const greaterChinaTimeZones = [
        ...mainlandTimeZones,
        "Asia/Hong_Kong",
        "Asia/Macau",
        "Asia/Taipei",
      ];

      // 根据 options 决定使用哪个时区集合
      const targetZones = new Set(
        mainland ? mainlandTimeZones : greaterChinaTimeZones,
      );
      return targetZones.has(timeZone);
    }
  }

  // 如果没有 Intl 或无法获取时区，使用 UTC 偏移量判断
  const offset = new Date().getTimezoneOffset();
  // 中国标准时间 UTC+8，对应的分钟偏移量为 -480
  return offset === -480;
}
