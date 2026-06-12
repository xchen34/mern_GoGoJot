import { useNavigate, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";

const EntryPage = () => {
    const navigate = useNavigate(); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [googleError, setGoogleError] = useState("");
    const [needsVerification, setNeedsVerification] = useState(false);
    const googleCodeClientRef = useRef(null);
    const googleInitializedRef = useRef(false);
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!email.trim() || !password.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        setNeedsVerification(false);
        try {
            const res = await api.post("/auth/login", { email, password });
            localStorage.setItem("accessToken", res.data.accessToken);
            toast.success("Login successful!");
            navigate("/", { replace: true });
        } catch (err) {
            console.error(err);
            if (err?.response?.status === 403) {
                setNeedsVerification(true);
            }
            toast.error(err?.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        if (!email.trim()) {
            toast.error("Enter your email first");
            return;
        }

        setResendLoading(true);
        try {
            const res = await api.post("/auth/resend-verification", { email });
            toast.success("If that account exists, a verification email was sent.");
            if (res.data?.demoVerificationToken) {
                const query = new URLSearchParams();
                query.set("email", email);
                query.set("token", res.data.demoVerificationToken);
                navigate(`/check-email?${query.toString()}`, { replace: true });
            }
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to resend verification email");
        } finally {
            setResendLoading(false);
        }
    };

    const handleGuest = async () => {
        try {
            const res = await api.post("/auth/guest");
            localStorage.setItem("accessToken", res.data.accessToken);
            navigate("/", { replace: true });
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Guest login failed");
        }
    };

    useEffect(() => {
        setGoogleError("");

        if (!googleClientId) {
            setGoogleError("Google Client ID is missing. Please set VITE_GOOGLE_CLIENT_ID in frontend/.env and restart Vite.");
            return;
        }

        const handleGoogleResponse = async (response) => {
            try {
                if (response?.error) {
                    setGoogleError(`Google login failed: ${response.error}`);
                    return;
                }

                const payload = response?.code
                    ? { code: response.code }
                    : response?.credential
                        ? { credential: response.credential }
                        : null;

                if (!payload) {
                    setGoogleError("Google login did not return a usable response.");
                    return;
                }

                const res = await api.post("/auth/google", payload);
                localStorage.setItem("accessToken", res.data.accessToken);
                toast.success("Google login successful!");
                navigate("/", { replace: true });
            } catch (err) {
                console.error(err);
                const message =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Google login failed";
                setGoogleError(message);
                toast.error(message);
            }
        };

        const initGoogle = () => {
            if (!window.google?.accounts?.id) {
                //setGoogleError("Google script loaded, but GIS is not available in this browser.");
                return;
            }

            if (googleInitializedRef.current) {
                return;
            }

            if (!window.google?.accounts?.oauth2?.initCodeClient) {
                return;
            }

            if (!googleCodeClientRef.current) {
                googleCodeClientRef.current = window.google.accounts.oauth2.initCodeClient({
                    client_id: googleClientId,
                    scope: "openid email profile",
                    ux_mode: "popup",
                    callback: handleGoogleResponse,
                });
            }

            googleInitializedRef.current = true;
        };

        const scheduleInit = () => {
            // Wait until the page finishes loading so we avoid layout work while stylesheets are still settling.
            if (document.readyState !== "complete") {
                window.addEventListener("load", initGoogle, { once: true });
                return () => window.removeEventListener("load", initGoogle);
            }

            const rafId = window.requestAnimationFrame(initGoogle);
            return () => window.cancelAnimationFrame(rafId);
        };

        if (window.google?.accounts?.id) {
            return scheduleInit();
        }

        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
            return scheduleInit();
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = scheduleInit;
        script.onerror = () => {
            setGoogleError("Failed to load Google script. Check network/ad-blocker and refresh.");
        };
        document.body.appendChild(script);

        return () => {
            googleInitializedRef.current = false;
        };
    }, [googleClientId, navigate]);

    const handleGoogleClick = () => {
        if (!googleCodeClientRef.current) {
            setGoogleError("Google Sign-In is not ready yet. Please wait a moment and try again.");
            return;
        }

        setGoogleError("");
        googleCodeClientRef.current.requestCode();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card bg-base-100 w-full max-w-md shadow">
                <div className="card-body space-y-4">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">GoGoJot</h1>
                        <p className="text-base-content/70 mt-2">
                           Jot it fast, keep the blast.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-3">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input 
                                type="email" 
                                id="login-email"
                                name="email"
                                placeholder="your@email.com" 
                                className="input input-bordered w-full"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input 
                                type="password" 
                                id="login-password"
                                name="password"
                                placeholder="••••••••" 
                                className="input input-bordered w-full"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>

                        <div className="text-right">
                            <Link to="/forgot-password" className="link link-primary text-sm">
                                Forgot password?
                            </Link>
                        </div>

                        {needsVerification && (
                            <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm">
                                <p className="mb-2 text-warning-content">
                                    Your email is not verified yet. Check your inbox or resend the verification email.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResendVerification}
                                    className="btn btn-warning btn-sm w-full"
                                    disabled={resendLoading}
                                >
                                    {resendLoading ? "Resending..." : "Resend Verification Email"}
                                </button>
                            </div>
                        )}
                    </form>

                    <div className="divider">OR</div>

                    <div className="space-y-2">
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={handleGoogleClick}
                                className="inline-flex w-80 items-center justify-center gap-3 rounded-full border border-gray-300 bg-white px-4 py-2 transition hover:bg-gray-50"
                            >
                                <img
                                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                    alt="Google"
                                    className="h-5 w-5"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Continuer avec Google
                                </span>
                            </button>
                        </div>
                        {googleError && (
                            <p className="text-center text-xs text-error">{googleError}</p>
                        )}
                    </div>

                    <button type="button" className="btn btn-outline w-full" onClick={handleGuest}>
                        Continue as Guest
                    </button>

                    <div className="text-center text-sm">
                        <span className="text-base-content/70">Don't have an account? </span>
                        <Link to="/signup" className="link link-primary font-medium">
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EntryPage;
