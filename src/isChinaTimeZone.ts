export function isChinaTimeZone(): boolean {
  if (typeof Intl === 'object' && typeof Intl.DateTimeFormat === 'function') {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) {
      const chinaTimeZones = [
        "Asia/Shanghai",
        "Asia/Chongqing",
        "Asia/Harbin",
        "Asia/Urumqi",
        "Asia/Hong_Kong",
        "Asia/Macau",
        "Asia/Taipei",
        "Asia/Beijing",
      ];
      return chinaTimeZones.includes(timeZone);
    }
  }
  // 如果没有 Intl 或无法获取时区，使用 UTC 偏移量判断
  const offset = new Date().getTimezoneOffset();
  // 中国标准时间 UTC+8，对应的分钟偏移量为 -480
  return offset === -480;
}
