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
    const googleBtnRef = useRef(null);
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

        if (!googleBtnRef.current) return;

        const handleGoogleResponse = async (response) => {
            try {
                const res = await api.post("/auth/google", { credential: response.credential });
                localStorage.setItem("accessToken", res.data.accessToken);
                toast.success("Google login successful!");
                navigate("/", { replace: true });
            } catch (err) {
                console.error(err);
                toast.error(err?.response?.data?.message || "Google login failed");
            }
        };
        console.log("googleClientId:", googleClientId);

        const initGoogle = () => {
            if (!window.google?.accounts?.id) {
                //setGoogleError("Google script loaded, but GIS is not available in this browser.");
                return;
            }

            // React StrictMode runs effects twice in development; initialize GIS once per client id.
            if (window.__gsiInitializedClientId !== googleClientId) {
                window.google.accounts.id.initialize({
                    client_id: googleClientId,
                    callback: handleGoogleResponse,
                });
                window.__gsiInitializedClientId = googleClientId;
            }

            googleBtnRef.current.innerHTML = "";
            window.google.accounts.id.renderButton(googleBtnRef.current, {
                theme: "outline",
                size: "large",
                shape: "pill",
                width: 320,
                text: "continue_with",
            });
        };

        if (window.google?.accounts?.id) {
            initGoogle();
            return;
        }

        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
            initGoogle();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        script.onerror = () => {
            setGoogleError("Failed to load Google script. Check network/ad-blocker and refresh.");
        };
        document.body.appendChild(script);
    }, [googleClientId, navigate]);

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
                            <div ref={googleBtnRef} />
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
