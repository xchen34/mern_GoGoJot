import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../lib/axios";

const ResetPasswordPage = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const token = searchParams.get("token") || "";

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!token) {
			toast.error("Missing reset token");
			return;
		}

		if (!password.trim() || !confirmPassword.trim()) {
			toast.error("Please fill in all fields");
			return;
		}

		if (password.length < 8) {
			toast.error("Password must be at least 8 characters");
			return;
		}

		if (password !== confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		setLoading(true);
		try {
			await api.post("/auth/reset-password", { token, password });
			toast.success("Password reset successful. Please sign in.");
			navigate("/login", { replace: true });
		} catch (err) {
			console.error(err);
			toast.error(err?.response?.data?.message || "Failed to reset password");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
			<div className="card bg-base-100 w-full max-w-md shadow">
				<div className="card-body space-y-4">
					<div className="text-center">
						<h1 className="text-2xl font-bold">Reset Password</h1>
						<p className="text-base-content/70 mt-2">Set a new password for your account.</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-3">
						<div className="form-control">
							<label className="label">
								<span className="label-text">New Password</span>
							</label>
							<input
								type="password"
								id="reset-password"
								name="password"
								placeholder="At least 8 characters"
								className="input input-bordered w-full"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={loading}
							/>
						</div>

						<div className="form-control">
							<label className="label">
								<span className="label-text">Confirm Password</span>
							</label>
							<input
								type="password"
								id="reset-confirm-password"
								name="confirmPassword"
								placeholder="Repeat your new password"
								className="input input-bordered w-full"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								disabled={loading}
							/>
						</div>

						<button type="submit" className="btn btn-primary w-full" disabled={loading}>
							{loading ? "Resetting..." : "Reset Password"}
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

export default ResetPasswordPage;
