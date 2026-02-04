// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra localStorage khi component mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Lỗi khi parse user data:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const foundUser = users.find(u => u.email === email && u.password === password);
        
        if (foundUser) {
          const userData = {
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            phone: foundUser.phone || '',
            createdAt: foundUser.createdAt
          };
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          resolve(userData);
        } else {
          reject('Email hoặc mật khẩu không đúng');
        }
      }, 500);
    });
  };

  const register = (userData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          
          if (users.some(u => u.email === userData.email)) {
            reject('Email đã được sử dụng');
            return;
          }
          
          const newUser = {
            id: Date.now().toString(),
            ...userData,
            createdAt: new Date().toISOString()
          };
          
          users.push(newUser);
          localStorage.setItem('users', JSON.stringify(users));
          
          const { password, ...userWithoutPassword } = newUser;
          setUser(userWithoutPassword);
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          
          resolve(userWithoutPassword);
        } catch (error) {
          reject('Đăng ký thất bại: ' + error.message);
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Sử dụng window.location để redirect thay vì useNavigate
    window.location.href = '/dang-nhap';
  };

  const updateProfile = (updatedData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const userIndex = users.findIndex(u => u.id === user.id);
          
          if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updatedData };
            localStorage.setItem('users', JSON.stringify(users));
            
            const updatedUser = { ...user, ...updatedData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            resolve(updatedUser);
          } else {
            reject('Không tìm thấy người dùng');
          }
        } catch (error) {
          reject('Cập nhật thất bại: ' + error.message);
        }
      }, 500);
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};