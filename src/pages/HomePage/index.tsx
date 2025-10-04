import SEGButton from "../../components/SEGButton";
import { logout } from "../../services/AuthService";

export const HomePage: React.FC = () => {

    const handleLogout = () => {

        logout();

    }

    return (
        <>
        <div>Home Page</div>
        <SEGButton onClick={handleLogout}>LOGOUT</SEGButton>
        </>
    );

};