import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../lib/axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userData, setUserData] = useState({
        email: "",
        name: ""
    });
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    });

    // 检查是否是 guest
    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            navigate("/entry");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            if (decoded.typ === "guest") {
                toast.error("Guest users don't have profiles");
                navigate("/");
                return;
            }
        } catch (err) {
            navigate("/entry");
            return;
        }

        fetchProfile();
    }, [navigate]);

    const fetchProfile = async () => {
        try {
            const res = await api.get("/auth/profile");
            setUserData(res.data.user);
            setFormData({
                email: res.data.user.email,
                name: res.data.user.name,
                oldPassword: "",
                newPassword: "",
                confirmNewPassword: ""
            });
        } catch (err) {
            console.error(err);
            toast.error("Failed to load profile");
            if (err.response?.status === 401) {
                navigate("/entry");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        // 验证密码
        if (formData.newPassword || formData.oldPassword) {
            if (!formData.oldPassword) {
                toast.error("Old password is required to change password");
                return;
            }
            if (!formData.newPassword) {
                toast.error("New password is required");
                return;
            }
            if (formData.newPassword !== formData.confirmNewPassword) {
                toast.error("New passwords do not match");
                return;
            }
            if (formData.newPassword.length < 8) {
                toast.error("Password must be at least 8 characters");
                return;
            }
        }

        setSaving(true);
        try {
            const updateData = {};
            
            // 只发送修改过的字段
            if (formData.name !== userData.name) {
                updateData.name = formData.name;
            }
            if (formData.email !== userData.email) {
                updateData.email = formData.email;
            }
            if (formData.newPassword) {
                updateData.oldPassword = formData.oldPassword;
                updateData.newPassword = formData.newPassword;
            }

            const res = await api.put("/auth/profile", updateData);
            
            setUserData(res.data.user);
            setFormData({
                ...formData,
                email: res.data.user.email,
                name: res.data.user.name,
                oldPassword: "",
                newPassword: "",
                confirmNewPassword: ""
            });
            
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title text-2xl mb-4">Profile Settings</h2>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            {/* 基本信息 */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Basic Information</h3>
                                
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Name</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="input input-bordered w-full"
                                        value={formData.name}
                                        onChange={handleChange}
                                        disabled={saving}
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Email</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="input input-bordered w-full"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={saving}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="divider"></div>

                            {/* 修改密码 */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Change Password</h3>
                                <p className="text-sm text-base-content/70">
                                    Leave blank if you don't want to change your password
                                </p>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Old Password</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        className="input input-bordered w-full"
                                        value={formData.oldPassword}
                                        onChange={handleChange}
                                        disabled={saving}
                                        placeholder="Enter old password"
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">New Password</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        className="input input-bordered w-full"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        disabled={saving}
                                        placeholder="Enter new password"
                                    />
                                </div>

                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Confirm New Password</span>
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmNewPassword"
                                        className="input input-bordered w-full"
                                        value={formData.confirmNewPassword}
                                        onChange={handleChange}
                                        disabled={saving}
                                        placeholder="Confirm new password"
                                    />
                                </div>
                            </div>

                            <div className="card-actions justify-end pt-4">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => navigate("/")}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;