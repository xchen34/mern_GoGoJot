import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../lib/axios";
import toast from "react-hot-toast";

// ===== DEMO EMAIL VERIFICATION PAGE START =====
const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("verifying");
    const didRunRef = useRef(false);
    const token = searchParams.get("token");

    useEffect(() => {
        if (didRunRef.current) return;
        didRunRef.current = true;

        const verify = async () => {
            if (!token) {
                setStatus("missing");
                return;
            }

            try {
                const res = await api.post("/auth/verify-email", { token });
                localStorage.setItem("accessToken", res.data.accessToken);
                toast.success("Email verified successfully");
                setStatus("success");
            } catch (err) {
                console.error(err);
                setStatus("error");
                toast.error(err?.response?.data?.message || "Email verification failed");
            }
        };

        verify();
    }, [navigate, token]);

    useEffect(() => {
        if (status !== "success") return;

        const timer = setTimeout(() => {
            navigate("/", { replace: true });
        }, 1000);

        return () => clearTimeout(timer);
    }, [navigate, status]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card bg-base-100 w-full max-w-md shadow">
                <div className="card-body text-center space-y-4">
                    {status === "verifying" && (
                        <>
                            <span className="loading loading-spinner loading-lg mx-auto"></span>
                            <h1 className="text-2xl font-bold">Verifying your email</h1>
                            <p className="text-base-content/70">Please wait while we confirm your account.</p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success text-2xl font-bold">
                                ✓
                            </div>
                            <h1 className="text-2xl font-bold">Verified successfully</h1>
                            <p className="text-base-content/70">
                                Your account is verified. Taking you to your dashboard...
                            </p>
                        </>
                    )}

                    {status === "missing" && (
                        <>
                            <h1 className="text-2xl font-bold">Missing verification token</h1>
                            <p className="text-base-content/70">This link is incomplete or expired.</p>
                            <Link to="/login" className="btn btn-primary">Back to Login</Link>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <h1 className="text-2xl font-bold">Verification failed</h1>
                            <p className="text-base-content/70">The link may have expired. Try signing in again and resend the verification email.</p>
                            <Link to="/login" className="btn btn-primary">Back to Login</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
// ===== DEMO EMAIL VERIFICATION PAGE END =====
