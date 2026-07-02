/**
 * 通过网络可达性判断是否是中国大陆网络环境（GFW 探测）
 *
 * 原理：同时探测两个资源
 * - 探针：在中国大陆被屏蔽的资源（gstatic generate_204）
 * - 对照：在大陆和海外都可达的资源（baidu favicon）
 *
 * 结果：
 * - 探针可达 → 不在大陆网络（或已走代理），返回 false
 * - 探针不可达但对照可达 → 典型 GFW 特征，返回 true
 * - 两者都不可达 → 可能离线或被浏览器扩展拦截，返回 null（无法判断）
 *
 * 与语言/时区/字体等设备信号不同，此方法反映的是**当前网络出口**，
 * 更接近服务端（如各类 API）实际看到的用户位置。
 * 注意：这是异步方法，且会产生真实网络请求。
 */
export async function isChinaByNetwork(options?: {
  /**
   * 单个探测请求的超时时间（毫秒）
   * @default 3000
   */
  timeout?: number;
}): Promise<boolean | null> {
  if (typeof fetch !== "function") return null;

  const timeout = options?.timeout ?? 3000;

  const probe = async (url: string): Promise<boolean> => {
    const controller =
      typeof AbortController === "function" ? new AbortController() : undefined;
    const timer = setTimeout(() => controller?.abort(), timeout);
    try {
      // no-cors：只关心请求是否完成，不读取响应内容
      await fetch(url, {
        mode: "no-cors",
        cache: "no-store",
        signal: controller?.signal,
      });
      return true;
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  };

  const [blockedSiteReachable, controlSiteReachable] = await Promise.all([
    probe("https://www.gstatic.com/generate_204"),
    probe("https://www.baidu.com/favicon.ico"),
  ]);

  if (blockedSiteReachable) return false;
  if (controlSiteReachable) return true;
  return null;
}
