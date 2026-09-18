import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { getCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [isLoading, setIsLoading] = useState(true);

    const [isAuthenticated, setIsAuthenticated] = useState(false);


    useEffect(() => {

    async function loadCurrentUser() {

        const token = localStorage.getItem("token");

        if (!token) {
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
        }

        try {

            const response = await getCurrentUser();

            setUser(response.user);
            setIsAuthenticated(true);

        } catch (error) {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setUser(null);
            setIsAuthenticated(false);

        } finally {
            setIsLoading(false);
        }

    }

    loadCurrentUser();

}, []);


    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    return useContext(AuthContext);
}