import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const getRateLimitIdentifier = (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const rawIp = typeof forwardedFor === "string"
        ? forwardedFor.split(",")[0].trim()
        : req.ip;
    const clientIp = rawIp ? ipKeyGenerator(rawIp) : "anonymous";

    return req.auth?.sub || clientIp || "anonymous";
};

const localWriteRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getRateLimitIdentifier,
    message: { message: "Too many write requests, please try again later." },
});

export default localWriteRateLimiter;
