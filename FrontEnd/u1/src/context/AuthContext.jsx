// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(); // ✅ TẠO CONTEXT

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // ✅ Hook nằm trong component
  const [loading, setLoading] = useState(true);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  /* ================= LOGIN ================= */
  const login = async (email, password) => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    // 🔥 LƯU TOKEN
    localStorage.setItem("token", data.token);

    // 🔥 LƯU USER
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);

    return data.user;
  };

  /* ================= UPDATE PROFILE (CALL API) ================= */
  const updateProfile = async (profileData) => {
    const res = await fetch("http://localhost:5000/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: user.id,        // ✅ thêm dòng này
        ...profileData
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };


  /* ================= CHANGE PASSWORD (CALL API) ================= */
  const changePassword = async (currentPassword, newPassword) => {
    const res = await fetch("http://localhost:5000/api/auth/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: user.id,
        currentPassword,
        newPassword
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Đổi mật khẩu thất bại");
    }

    return data;
  };




  /* ================= REGISTER (CALL API) ================= */
  const register = async (userData) => {
    const res = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    console.log("STATUS:", res.status);
    console.log("DATA:", data);

    if (!res.ok) {
      throw new Error(data.message || "Đăng ký thất bại");
    }

    return data;
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/dang-nhap";
  };

  /* ================= HELPERS ================= */
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  const isPartner = user?.role === "partner";
  const isCustomer = user?.role === "customer";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        updateProfile,
        changePassword,
        logout,
        isAuthenticated,
        isAdmin,
        isPartner,
        isCustomer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};