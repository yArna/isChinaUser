/** 通过 Emoji 判断当前设备是否是中国大陆用户
 *  如果 🇹🇼 字符无法彩色显示（渲染为黑白字母或完全不渲染），说明更像中国大陆设备
 *
 *  为了避免误报，会先用 😀 做对照：
 *  如果设备连普通 Emoji 都无法彩色渲染（如无彩色 Emoji 字体的 Linux、
 *  开启指纹保护的浏览器），返回 null 表示无法判断，而不是误报为 true
 *
 * 如果是 Windows 环境，不能通过此方法判断，因为 Windows 所有国旗 Emoji 都不支持显示 */
export function isChinaByEmoji(): boolean | null {
  if (typeof document === "undefined") return null;
  if (isWindows()) return null;

  try {
    // 对照组：😀 在所有支持彩色 Emoji 的设备上都应渲染为彩色
    const control = getCharColors("😀");
    if (control.opaquePixelCount === 0 || control.isMono) {
      // 设备本身不支持彩色 Emoji 渲染（或 canvas 被指纹保护干扰），无法判断
      return null;
    }

    const flag = getCharColors("🇹🇼");
    if (flag.opaquePixelCount === 0) {
      // 对照组正常但旗帜完全不渲染 → 系统屏蔽了该 Emoji
      return true;
    }
    // 渲染为黑白（通常是 "TW" 字母回退）→ 系统屏蔽了旗帜图案
    return flag.isMono;
  } catch {
    // canvas 不可用（如某些无头环境）时返回无法判断，而不是抛错
    return null;
  }
}

function getCharColors(char: string): {
  colors: number[][];
  isMono: boolean;
  opaquePixelCount: number;
} {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const fontSize = 100;

  if (!ctx) {
    throw new Error("Canvas context not supported");
  }

  canvas.width = fontSize;
  canvas.height = fontSize;

  // 使用系统字体渲染
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = "black";
  ctx.textBaseline = "top";

  // 渲染字符到画布
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillText(char, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const colorSet = new Set<string>();
  let isMono = true;
  let opaquePixelCount = 0;

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const a = imageData.data[i + 3];

    if (a > 0) {
      opaquePixelCount++;
      const color = `${r},${g},${b}`;
      colorSet.add(color);

      // 判断颜色是否为黑白（即 R、G、B 值相同）
      if (isMono && !(r === g && g === b)) {
        isMono = false;
      }
    }
  }

  // 转换 Set 为二维颜色数组
  const colors = Array.from(colorSet).map((color) =>
    color.split(",").map(Number),
  );

  canvas.remove();

  return {
    colors,
    isMono,
    opaquePixelCount,
  };
}

/** 判断是否为 Windows 系统 */
function isWindows(): boolean {
  if (navigator.platform?.startsWith("Win")) return true;
  // navigator.platform 已被废弃，部分浏览器可能返回空，回退到 userAgent
  return /Windows/i.test(navigator.userAgent ?? "");
}
