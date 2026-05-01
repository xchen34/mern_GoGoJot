import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";

const SignupPage = () => {
    const navigate = useNavigate();
    const [ formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        name: "" 
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        // 前端验证
        if (!formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()) {
            toast.error("Email and password are required");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/auth/signup", {
                email: formData.email,
                password: formData.password,
                name: formData.name || undefined // 如果为空则不发送
            });

            const query = new URLSearchParams();
            query.set("email", formData.email);
            if (res.data?.demoVerificationToken) {
                query.set("token", res.data.demoVerificationToken);
            }

            toast.success("Account created. Open the demo email to verify your account.");
            // ===== DEMO EMAIL PREVIEW FLOW START =====
            // After signup, send users into the in-app email preview instead of a real inbox.
            navigate(`/check-email?${query.toString()}`, { replace: true });
            // ===== DEMO EMAIL PREVIEW FLOW END =====
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Signup failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card bg-base-100 w-full max-w-md shadow">
                <div className="card-body space-y-4">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">Create Account</h1>
                        <p className="text-base-content/70 mt-2">
                            Join GoGoJot today
                        </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-3">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                placeholder="your@email.com"
                                className="input input-bordered w-full"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Name (Optional)</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Your Name"
                                className="input input-bordered w-full"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                className="input input-bordered w-full"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />
                            <label className="label">
                                <span className="label-text-alt text-base-content/60">
                                    At least 8 characters
                                </span>
                            </label>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Confirm Password</span>
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                className="input input-bordered w-full"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={loading}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-base-content/70">Already have an account? </span>
                        <Link to="/login" className="link link-primary font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
