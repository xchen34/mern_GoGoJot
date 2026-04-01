import ratelimit from "../config/upstash.js"

//这段代码是一个 polyfill（兼容性补丁），用于确保 Node.js 环境中有 fetch 函数可用。
//globalThis: 全局对象
// 在浏览器中 = window
// 在 Node.js 中 = global
// globalThis 是统一的全局对象访问方式
// if (!globalThis.fetch): 检查全局是否已有 fetch
// Node.js 18+ 内置了 fetch
// Node.js 17 及以下版本没有 fetch
// globalThis.fetch = fetch: 如果没有，就添加上
// 从 node-fetch 导入的 fetch 赋值给全局对象
// 这样 @upstash/redis 等依赖 fetch 的库就能正常工作
// 为什么需要这个？
// @upstash/redis 内部使用 fetch 发送 HTTP 请求到 Upstash Redis REST API。如果你的 Node.js 版本较低（< 18），会报错：
// ReferenceError: fetch is not defined
import fetch from "node-fetch";
if (!globalThis.fetch) {
    globalThis.fetch = fetch;
}

const getRateLimitIdentifier = (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const clientIp = typeof forwardedFor === "string"
        ? forwardedFor.split(",")[0].trim()
        : req.ip;

    return req.auth?.sub || clientIp || "anonymous";
};

// 实现具体的业务逻辑。若外部限流服务暂时不可用，则降级放行，避免整站 API 直接 500。
const rateLimiter = async (req, res, next) => {
    try{
        const identifier = getRateLimitIdentifier(req);
        const {success} = await ratelimit.limit(identifier);
        //limiter.limit方法会返回一个对象 包含 success 属性 表示是否通过限流检查 {success: true/false, limit: number, remaining: number, reset: number}
        if (!success) {
            return res.status(429).json({message: "Too many requests"}) 
        }
        next();
    } catch (error) {
        console.log("Rate limit error鸭鸭鸭", error);
        next();
    }
};




// const rateLimiter = async (req, res, next) => {
//     try{
//         // 使用用户的 IP 地址作为唯一标识  也可用用用户ID等其他标识
//         const identifier = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
        
//         const {success} = await ratelimit.limit(identifier); // ← 改成动态的
        
//         if (!success) {
//             return res.status(429).json({message: "Too many requests"}) 
//         }
//         next();
//     } catch (error) {
//         console.log("Rate limit erro 鸭鸭鸭", error);
//         next(error);
//     }
// };

// // 1. 按 IP 限流（匿名用户）
// const identifier = req.ip;

// // 2. 按用户 ID 限流（已登录用户）
// const identifier = req.user?.id || req.ip;

// // 3. 按 API 路径限流（不同接口不同限制）
// const identifier = `${req.ip}:${req.path}`;









export default rateLimiter;
