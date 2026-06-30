/**
 * 通过浏览器可用中文字体判断是否更像中文用户环境
 */
export function isChinaByFont(): boolean {
  if (typeof document === "undefined") return false;

  const chineseFonts = [
    "Microsoft YaHei",
    "Microsoft JhengHei",
    "SimSun",
    "SimHei",
    "KaiTi",
    "FangSong",
    "PingFang SC",
    "PingFang TC",
    "PingFang HK",
    "Hiragino Sans GB",
    "Heiti SC",
    "Songti SC",
    "STHeiti",
    "STSong",
    "Noto Sans CJK SC",
    "Noto Sans CJK TC",
    "Source Han Sans SC",
    "Source Han Serif SC",
    "WenQuanYi Micro Hei",
  ];

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return false;
  }

  const result = chineseFonts.some((font) => isFontAvailable(ctx, font));

  canvas.remove();
  return result;
}

function isFontAvailable(ctx: CanvasRenderingContext2D, font: string): boolean {
  const baseFonts = ["monospace", "sans-serif", "serif"];
  const sample = "mmmmmmmmmmlli中文测试";

  return baseFonts.some((baseFont) => {
    ctx.font = `72px ${baseFont}`;
    const baseWidth = ctx.measureText(sample).width;
    ctx.font = `72px "${font}", ${baseFont}`;
    const fontWidth = ctx.measureText(sample).width;

    return fontWidth !== baseWidth;
  });
}
