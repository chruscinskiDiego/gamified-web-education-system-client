import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import { HomePage } from "../pages/HomePage";
import { useContext } from "react";
import { ProfileContext } from "../contexts/ProfileContext";

export const Router: React.FC = () => {

    const { isAuthenticated } = useContext(ProfileContext)!;

    return (
        <Routes>

            {!isAuthenticated && (
                <>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/signin" element={<LoginPage />} />
                    <Route path="/signup" element={<RegisterPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </>
            )}

            {isAuthenticated && (
                <>
                <Route path="/" element={<HomePage />} />
                <Route path="/homepage" element={<HomePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
                </>
            )}

        </Routes>

    )
}
