import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!email.trim()) {
			toast.error("Please enter your email");
			return;
		}

		setLoading(true);
		try {
			await api.post("/auth/forgot-password", { email });
			toast.success("If that email exists, a reset link has been sent.");
		} catch (err) {
			console.error(err);
			toast.error(err?.response?.data?.message || "Failed to send reset email");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
			<div className="card bg-base-100 w-full max-w-md shadow">
				<div className="card-body space-y-4">
					<div className="text-center">
						<h1 className="text-2xl font-bold">Forgot Password</h1>
						<p className="text-base-content/70 mt-2">Enter your account email to receive a reset link.</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-3">
						<div className="form-control">
							<label className="label">
								<span className="label-text">Email</span>
							</label>
							<input
								type="email"
								id="forgot-email"
								name="email"
								placeholder="your@email.com"
								className="input input-bordered w-full"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={loading}
							/>
						</div>

						<button type="submit" className="btn btn-primary w-full" disabled={loading}>
							{loading ? "Sending..." : "Send Reset Link"}
						</button>
					</form>

					<div className="text-center text-sm">
						<Link to="/login" className="link link-primary font-medium">
							Back to Login
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
