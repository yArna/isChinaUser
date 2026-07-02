import { isChinaByEmoji } from "./isChinaByEmoji";
import { DEFAULT_CHINESE_FONTS, isChinaByFont } from "./isChinaByFont";
import { isChinaByLanguage } from "./isChinaByLanguage";
import { isChinaByNetwork } from "./isChinaByNetwork";
import { isChinaByTimeZone } from "./isChinaByTimeZone";

export {
  DEFAULT_CHINESE_FONTS,
  isChinaByEmoji,
  isChinaByFont,
  isChinaByLanguage,
  isChinaByNetwork,
  isChinaByTimeZone,
};

/** 判断当前用户是中国用户
 *  - 语言（语言列表任一项出现中文）
 *  - 时区
 *  - 设备特征
 *  三者**任意满足其一**即判断为中国用户
 *
 * 如果是 Windows 系统不判断设备特征
 *
 * 默认情况中国大陆、台湾、香港、澳门都视作中国用户
 * 如果要判断
 */
export function isChinaUser(options?: {
  /**
   * 是否严格限制为仅中国大陆
   * @default false (默认包含台湾、香港、澳门)
   */
  mainland?: boolean;
  /**
   * 更严格的检测：
   * - 是否仅检查最高优先级的首选语言，默认只要语言列表出现中文都算中文
   * - 仅已知时区，而不退回到 UTC-8 
   */
  strict?: boolean;
}) {
  return (
    isChinaByLanguage(options) ||
    isChinaByTimeZone(options) ||
    isChinaByEmoji() ||
    isChinaByFont()
  );
}
