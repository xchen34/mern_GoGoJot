import { Link, useLocation, useNavigate } from "react-router-dom";

// ===== DEMO EMAIL PREVIEW PAGE START =====
const EmailPreviewPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const email = params.get("email") || "";
    const token = params.get("token") || "";
    const queryString = new URLSearchParams();
    if (email) queryString.set("email", email);
    if (token) queryString.set("token", token);

    const openVerification = () => {
        if (!token) return;
        navigate(`/verify-email?token=${encodeURIComponent(token)}`);
    };

    return (
        <div className="min-h-screen bg-base-200 px-4 py-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Mail Preview</h1>
                        <p className="text-base-content/70 mt-1">
                            A built-in preview of the verification email for portfolio demos.
                        </p>
                    </div>
                    <Link to={`/check-email?${queryString.toString()}`} className="btn btn-ghost">
                        Back
                    </Link>
                </div>

                <div className="rounded-2xl border border-base-300 bg-base-100 shadow-xl">
                    <div className="border-b border-base-300 px-6 py-4">
                        <div className="flex flex-col gap-1 text-sm text-base-content/70">
                            <span><strong>From:</strong> GoGoJot &lt;no-reply@GoGoJot.com&gt;</span>
                            <span><strong>To:</strong> {email || "demo user"}</span>
                            <span><strong>Subject:</strong> Verify your GoGoJot email</span>
                        </div>
                    </div>

                    <div className="space-y-4 px-6 py-8">
                        <p className="text-base-content/80">
                            Welcome to GoGoJot. Your account is ready, but we need one quick step to verify your email address.
                        </p>

                        <div className="rounded-xl bg-base-200 p-4">
                            <h2 className="text-xl font-semibold mb-2">Your verification link</h2>
                            <p className="text-sm text-base-content/70 mb-4">
                                Click the button below to finish verification and unlock the app.
                            </p>
                            <button
                                type="button"
                                onClick={openVerification}
                                className="btn btn-primary"
                                disabled={!token}
                            >
                                Verify Email
                            </button>
                        </div>

                        <p className="text-sm text-base-content/70">
                            This preview is part of the portfolio demo and stays inside the site.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmailPreviewPage;
// ===== DEMO EMAIL PREVIEW PAGE END =====
