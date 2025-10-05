import SEGButton from "../../components/SEGButton";
import { logout } from "../../services/AuthService";
import { getXpInfo } from "../../services/XpService";

export const HomePage: React.FC = () => {

    const xp = getXpInfo(250);
    console.log(xp);

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