import { createContext, useContext, useState, useEffect } from "react";
import axios from "../config/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await axios.get("/users/current-user");
        setUser(response.data.data);
      } catch (error) {
        setUser(null);
        // Optionally: remove token from storage if unauthorized
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  // Prevent rendering children until loading is done
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
