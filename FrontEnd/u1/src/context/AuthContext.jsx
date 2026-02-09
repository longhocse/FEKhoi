// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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
  const login = (email, password, role = null) => {

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem("users") || "[]");

        const foundUser = users.find(
  (u) => u.email === email && u.password === password
);



        if (!foundUser) {
          reject("Email / mật khẩu / vai trò không đúng");
          return;
        }

        const userData = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role || "customer",
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        resolve(userData);
      }, 500);
    });
  };

  /* ================= REGISTER (CUSTOMER) ================= */
  const register = (data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem("users") || "[]");

        if (users.some((u) => u.email === data.email)) {
          reject("Email đã tồn tại");
          return;
        }

        const newUser = {
          id: Date.now().toString(),
          role: "customer",
          ...data,
          createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));

        const { password, ...safeUser } = newUser;
        setUser(safeUser);
        localStorage.setItem("user", JSON.stringify(safeUser));

        resolve(safeUser);
      }, 500);
    });
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
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
        logout,
        isAuthenticated,
        isAdmin,
        isPartner,
        isCustomer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
