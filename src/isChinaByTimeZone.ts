/**
 * 通过时区判断是否是中国用户
 */
export function isChinaByTimeZone(options?: {
  /**
   * 是否严格限制为仅中国大陆
   * @default false (默认包含台湾、香港、澳门)
   */
  mainland?: boolean;

  /**
   * 更严格的检测：
   * - 仅已知时区，而不退回到 UTC-8
   */
  strict?: boolean;
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
        "Asia/Kashgar",
        "Asia/Beijing",
        // tzdata 旧式别名，部分老系统/容器环境会直接返回
        "PRC",
      ];

      const greaterChinaTimeZones = [
        ...mainlandTimeZones,
        "Asia/Hong_Kong",
        "Asia/Macau",
        "Asia/Taipei",
        // tzdata 旧式别名
        "Hongkong",
        "ROC",
      ];

      // 根据 options 决定使用哪个时区集合
      const targetZones = new Set(
        mainland ? mainlandTimeZones : greaterChinaTimeZones,
      );
      return targetZones.has(timeZone);
    }
  }

  if (options?.strict) {
    // 严格模式直接返回 false
    return false;
  } else {
    // 如果没有 Intl 或无法获取时区，使用 UTC 偏移量判断
    // 注意：UTC+8 同时覆盖新加坡、马来西亚、菲律宾、文莱、蒙古、澳大利亚珀斯等地区，
    // 此回退存在较大误报范围；且无法区分大陆与港澳台（mainland 选项在此路径下不生效）
    const offset = new Date().getTimezoneOffset();
    // 中国标准时间 UTC+8，对应的分钟偏移量为 -480
    return offset === -480;
  }
}
