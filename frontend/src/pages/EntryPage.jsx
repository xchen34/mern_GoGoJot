import { useNavigate, Link } from "react-router";
import { useState } from "react";
import api from "../lib/axios";
import toast from "react-hot-toast";

const EntryPage = () => {
    const navigate = useNavigate(); 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!email.trim() || !password.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/auth/login", { email, password });
            localStorage.setItem("accessToken", res.data.accessToken);
            toast.success("Login successful!");
            navigate("/", { replace: true });
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <div className="card bg-base-100 w-full max-w-md shadow">
                <div className="card-body space-y-4">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">ThinkBoard</h1>
                        <p className="text-base-content/70 mt-2">
                            Welcome back! Sign in to continue.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-3">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input 
                                type="email" 
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
                    </form>

                    <div className="divider">OR</div>

                    <button className="btn btn-outline w-full" onClick={handleGuest}>
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
