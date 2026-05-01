import { PlusIcon, LogOutIcon, UserIcon } from 'lucide-react'
import React from 'react'
import {Link, useNavigate} from "react-router-dom"
import toast from 'react-hot-toast'
import api from "../lib/axios";
import { decodeJwt } from "../lib/utils";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 删除本地存储的 Access Token 并清理刷新 Token cookie
    localStorage.removeItem("accessToken");
    api.post("/auth/logout").catch(() => {});
    toast.success("Logged out successfully");
    // 重定向到登录页面
    navigate("/login", {replace: true});
  }
   const isGuest = () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return false;
      const decoded = decodeJwt(token);
      return decoded?.typ === "guest";
    } catch {
      return false;
    }};
  
  
  return (
  <header className="bg-base-300 border-b border-base-content/10">
    <div className="mx-auto max-w-6xl p-4">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-primary font-mono tracking-tight">GoGoJot</h1>
                <p className="text-sm text-base-content/70">Simple notes, clear mind.</p>
            </div>
            <div className="flex items-center gap-4">
                <Link to={"/create"} className="btn btn-primary">
                    <PlusIcon className='size-5' />
                    <span>New Note</span>
                </Link>    
           {!isGuest() && (
            <Link to={"/profile"} className="btn btn-outline btn-secondary">
              <UserIcon className='size-5' />
              <span className="hidden sm:inline">Profile</span>
            </Link>
           )}
            <button onClick={handleLogout} className="btn btn-error btn-outline">
              <LogOutIcon className='size-5' />
              <span className="hidden sm:inline">Logout</span>
            </button>
            
            </div>
        </div>
    </div> 
 </header>
)
}

export default Navbar
