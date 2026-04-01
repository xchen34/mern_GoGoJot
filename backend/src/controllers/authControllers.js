import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { signAccessToken, signRefreshToken } from "../config/jwt.js";
import { z } from "zod"; //用于验证输入数据
import transporter from "../config/mailer.js";



// 这里的 Zod 是什么？只查格式还是查数据库？
// Zod 是一个工具库：没错，它专门用来做数据验证（Validation）。
// 它只查“格式” 这样你就不用单独写if (email.includes("@")) ... 这种繁琐的判断了
//确保用户在注册时提交了合法的邮箱、符合长度要求的密码，以及可选的名字。
const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(72),
    name: z.string().max(50).optional(),
});

//确保用户在登录时提交了合法的邮箱和符合长度要求的密码。
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8).max(72),
});

const googleLoginSchema = z.object({
    credential: z.string().min(20),
});


const updateProfileSchema = z.object({
    name: z.string().max(50).optional(),
    email: z.string().email().optional(),
    oldPassword: z.string().min(8).max(72).optional(),
    newPassword: z.string().min(8).max(72).optional(),
});

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


//当用户登录或刷新 Token 时，调用此函数把长效的 refreshToken 种在浏览器里。
//res.cookie()第一个参数是
const isLocalhost = (host = "") =>
    host === "localhost" || host === "127.0.0.1";

const isHttpsRequest = (req) => {
    if (!req) return false;
    const xfProto = req.headers["x-forwarded-proto"];
    return req.secure === true || xfProto === "https";
};

const shouldSecureCookie = (req) => {
    if (isLocalhost(req?.hostname)) return false;
    if (process.env.NODE_ENV !== "production") return false;
    return isHttpsRequest(req);
};

const getSameSitePolicy = (req) => {
    if (isLocalhost(req?.hostname)) return "lax";
    return process.env.NODE_ENV === "production" ? "strict" : "lax";
};

const setRefreshCookie = (res, token, req) => {
    res.cookie("refreshToken", token, {
        httpOnly: true, //// 关键安全设置：防止前端 JS 代码 (如 XSS 攻击) 访问此 Cookie
        secure: shouldSecureCookie(req),// 仅在生产 + HTTPS 下启用；本地开发禁用
        sameSite: getSameSitePolicy(req),// 开发/本地放宽避免调试卡住
        maxAge: 7 * 24 * 60 * 60 * 1000 // cookie有效期7days ms毫秒为单位
    });
}

export const guest = async (req, res) => {
    try {
        // 检查环境变量是否加载
        if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
            console.error("❌ ERROR: JWT_ACCESS_SECRET or JWT_REFRESH_SECRET is missing in .env");
            return res.status(500).json({ message: "Server configuration error (Missing JWT Secrets)" });
        }

        const guestId = crypto.randomBytes(16).toString("hex"); // 兼容旧版 Node.js
        const payload = { sub: guestId, typ: "guest" };

        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        setRefreshCookie(res, refreshToken, req);
        console.log("Guest login successful for ID:", guestId);
        res.json({ accessToken, mode: "guest" });
    } catch (error) {
        console.error("Guest Login Error:", error);
        res.status(500).json({ message: "Internal Server Error during Guest Login" });
    }
};

export const signup = async (req, res) => {
    try{
        const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });

    const { email, password, name } = parsed.data;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash, name });

    // Welcome email should be best-effort and must not block signup success.
    try {
        await transporter.sendMail({
            from: "no-reply@yourapp.com",
            to: user.email,
            subject: "Welcome!",
            text: "Thanks for signing up.",
        });
    } catch (mailError) {
        console.error("Welcome email failed:", mailError);
    }

    const payload = { sub: user._id.toString(), typ: "user", email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    setRefreshCookie(res, refreshToken, req);
    res.status(201).json({ accessToken, user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Internal Server Error during Signup" });
    }
};
export const login = async (req, res) => {
   try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.passwordHash) return res.status(401).json({ message: "Please sign in with Google" });

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) return res.status(401).json({ message: "Invalid credentials" });

    const payload = { sub: user._id.toString(), typ: "user", email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    setRefreshCookie(res, refreshToken, req);
    res.json({ accessToken, user: { id: user._id, email: user.email, name: user.name } });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error during Login" });
    }
};

export const googleLogin = async (req, res) => {
    try {
        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).json({ message: "Server configuration error (Missing GOOGLE_CLIENT_ID)" });
        }

        const parsed = googleLoginSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });

        const { credential } = parsed.data;
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload?.email) {
            return res.status(400).json({ message: "Google account email is missing" });
        }

        let user = await User.findOne({ email: payload.email });
        if (!user) {
            user = await User.create({
                email: payload.email,
                name: payload.name || payload.given_name || "",
                passwordHash: null,
            });
        }

        const jwtPayload = { sub: user._id.toString(), typ: "user", email: user.email };
        const accessToken = signAccessToken(jwtPayload);
        const refreshToken = signRefreshToken(jwtPayload);
        setRefreshCookie(res, refreshToken, req);

        return res.json({
            accessToken,
            user: { id: user._id, email: user.email, name: user.name || "" },
        });
    } catch (error) {
        console.error("Google Login Error:", error);
        return res.status(401).json({ message: "Invalid Google credential" });
    }
};
export const refresh = async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        const payload = { sub: decoded.sub, typ: decoded.typ, email: decoded.email };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);
        setRefreshCookie(res, refreshToken, req);
        res.json({ accessToken });
    } catch (error) {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
};
export const logout = async (req, res) => {
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully鸭鸭鸭" });
};



export const getProfile = async (req, res) => {
    try{
        if (req.auth.typ === "guest") return res.status(403).json({ message: "Guests do not have profiles" });
       //从数据库中获取用户信息，排除密码哈希字段 -passwordHash 是 mongoose 的语法 用于排除某个字段
        const user = await User.findById(req.auth.sub).select("-passwordHash");
        if (!user) return res.status(404).json({message: "User not found" });
        res.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name || "",
            }
        });
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ message: "Internal Server Error during Get Profile" });
    }
};      

export const updateProfile = async (req, res) => {
    try {
        if (req.auth.typ === "guest") return res.status(403).json({message: "Guests cannot update profles" });

        const parsed = updateProfileSchema.safeParse(req.body);
        if (!parsed.success) return res.status(400).json({ message: parsed.error.issues[0].message });

        const { name, email, oldPassword, newPassword} = parsed.data;
        const user = await User.findById(req.auth.sub);
        if (!user) return res.status(404).json({ message: "User not found" });

        //如果要更改密码
        if (newPassword) {
            if (!oldPassword) return res.status(400).json({ message: "Old password is required to set a new password" });

            const passwordMatch = await bcrypt.compare(oldPassword, user.passwordHash);
            if (!passwordMatch) return res.status(401).json({ message: "Old password is incorrect" });

            user.passwordHash = await bcrypt.hash(newPassword, 12);
        }
        //更新mail
        if (email && email !== user.email)
        {
            const existing = await User.findOne({email});
            if (existing) return res.status(409).json({ message: "Email is already in use" });
            user.email = email;
        }
        if (name !== undefined) user.name = name; //如果name属性存在则更新 哪怕是空字符串

        await user.save();
        res.json({ message: "Profile updated successfully" ,
            user: {
                id: user._id,
                email: user.email,
                name: user.name || "",
            }
        });
        
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Internal Server Error during Update Profile" });
    }
};




const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(20),
  password: z.string().min(8).max(72),
});

export const forgotPassword = async (req, res) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const { email } = parsed.data;
    const user = await User.findOne({ email });

    // 防用户枚举：无论用户是否存在都返回同样信息
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

    try {
      await transporter.sendMail({
        from: "no-reply@yourapp.com",
        to: user.email,
        subject: "Reset your password",
        text: `Click this link to reset your password: ${resetLink}\nThis link expires in 15 minutes.`,
      });
    } catch (mailError) {
      console.error("Reset email failed:", mailError);
    }

    return res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error during Forgot Password" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const { token, password } = parsed.data;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error during Reset Password" });
  }
};






//这个文件 (
// authControllers.js
// ) 是运行在服务器上的逻辑代码。它可以控制能不能去访问数据库。

// 整个流程是这样的：

// 用户：点击“注册”按钮，发送数据。
// 服务器（Zod）：先看一眼数据。“咦，邮箱没写 @ 符号？” -> 直接报错，流程结束。（这一步你已经写了 Schema）
// 服务器（Controller）：如果 Zod 说格式没问题。代码会继续执行：
// 去数据库查一下：“这个邮箱在 User 表里已经存在了吗？”
// 如果存在 -> 报错“用户已存在”。
// 如果不存在 -> 用 bcrypt 把密码加密，然后存入数据库。（这一步你还没写！）



// 第三个参数 { ... } (Options 对象)
// 这是什么？：这是配置规则（或者说是“说明书”）。
// 存在哪？：这些规则会被浏览器读取并存储在 Cookie 的元数据（Metadata）里。它们不会作为数据发回给服务器，而是给浏览器看的指令。
// 看看你里面写的规则是啥意思：

// httpOnly: true (给浏览器看的)：
// 命令：“浏览器你听好了，这个 Cookie 只准通过 HTTP 请求发给服务器，不准让网页里的 JavaScript (document.cookie) 读取或修改它！”
// 目的：防止黑客写脚本偷你的 Token。
// secure: true (给浏览器看的)：
// 命令：“只有在加密链接 (HTTPS) 下才能发送这个 Cookie。”
// 目的：防止 Token 在网上传输时被窃听。
// maxAge (给浏览器看的)：
// 命令：“这饼干保质期 7 天，7 天后自动扔掉（删除）。”

// Cache (缓存) 是怎么存的？
// 不仅仅是内容，还是“复印件”：Cache 是浏览器自动在你的硬盘或内存里划了一块地，专门用来存图片、CSS、JS 文件。
// 怎么存：它像一个巨大的哈希表 (Map)。
// Key (键)：文件的网址 (URL)，比如 .../logo.png。
// Value (值)：文件的实际内容。
// 流程：下次你访问网页，浏览器先看这块地：“咦，logo.png 我之前下载过，也没过期。” -> 直接从硬盘读取，0 秒加载，不费流量。


// Session (会话) 到底是什么？
// 它是服务器记的“日记”。服务器在自己内存或数据库里建了一个档案袋（Session），专门记你的状态。
// Session 是服务器为某个用户维护的一份“跨请求的状态记录” 多个请求之间 服务器还能记得你是谁、做过什么
//服务器给每个用户分配一个sessionid 存在cookie中 下次用户访问时服务器根据sessionid找到对应的session信息

//cookie可以存在cookie但必须是 httpOnly + secure 否则就和存localStorage一样会被攻击利用如CSRF攻击 localstorage就会暴露给javascript脚本窃取XSS攻击


// | 对比        | Session   | token(jwt)           |
// | --------- | --------- | ----------------- |
// | 数据存哪      | 服务器       | 客户端               |
// | 是否有状态     | 有         | 无                 |
// | cookie 里放 | sessionId | token             |
// | XSS 风险    | 低         | 高（若 localStorage） |
// | 服务器压力     | 高         | 低                 |
// | 横向扩展      | 麻烦        | 容易                |
