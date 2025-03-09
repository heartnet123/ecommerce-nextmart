"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export default function LogoutButton() {
  const router = useRouter();
  
  const handleLogout = async () => {
    try { 
      const accessToken = localStorage.getItem("accessToken");
      
      // Call logout API
      await axios.post(
        "http://127.0.0.1:8000/api/auth/logout/",
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      // Clear cookies
      document.cookie = "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      
      toast.success("ออกจากระบบสำเร็จ");
      
      // Redirect to homepage and refresh
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      
      // Clear localStorage and cookies even if API call fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      
      // Clear cookies
      document.cookie = "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      document.cookie = "user=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      
      toast.success("ออกจากระบบสำเร็จ");
      router.push("/");
      router.refresh();
    }
  };

  return (
    <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
      <div className="flex items-center w-full">
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </div>
    </DropdownMenuItem>
  );
}