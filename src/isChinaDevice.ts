export function isChinaDevice(options?: { detectChar: string }) {
  let detectChar = options?.detectChar ?? "🇹🇼";
  let result = getCharColors(detectChar);
  //   console.log("isChinaDevice result:", result);
  return result.isMono;
}

function getCharColors(char: string): { colors: number[][]; isMono: boolean } {
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

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const a = imageData.data[i + 3];

    if (a > 0) {
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
    color.split(",").map(Number)
  );

  canvas.remove();

  return {
    colors,
    isMono,
  };
}
