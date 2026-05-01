import { Link, useLocation, useNavigate } from "react-router-dom";

// ===== DEMO RESET EMAIL PREVIEW PAGE START =====
const CheckResetEmailPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const email = params.get("email") || location.state?.email || "";
    const token = params.get("token") || location.state?.token || "";

    const openPreview = () => {
        const query = new URLSearchParams();
        if (email) query.set("email", email);
        if (token) query.set("token", token);
        navigate(`/reset-email-preview?${query.toString()}`);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card bg-base-100 w-full max-w-lg shadow">
                <div className="card-body space-y-4">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">Check your email</h1>
                        <p className="text-base-content/70 mt-2">
                            We sent a password reset email to {email || "your inbox"}.
                        </p>
                    </div>

                    <div className="rounded-xl border border-base-300 bg-base-200/50 p-4 text-sm text-base-content/80">
                        <p className="font-medium text-base-content mb-2">Demo mode</p>
                        <p>
                            To keep this portfolio self-contained, you can open a built-in email preview instead of leaving the site.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openPreview}
                        className="btn btn-primary w-full"
                        disabled={!token}
                    >
                        Open demo reset email
                    </button>

                    <p className="text-xs text-base-content/60 text-center">
                        {token ? "This preview will let you finish password reset inside the app." : "Demo preview is unavailable for this session."}
                    </p>

                    <div className="text-center">
                        <Link to="/login" className="link link-primary text-sm">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckResetEmailPage;
// ===== DEMO RESET EMAIL PREVIEW PAGE END =====
