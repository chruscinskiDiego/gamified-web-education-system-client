import { Outlet } from "react-router-dom"
import Navbar from "../../components/Navbar"

export const ProtectedLayout: React.FC = () => {

    return (
        <>
        <Navbar />
         <main style={{ paddingTop: 32}}>
        <Outlet />
      </main>
        </>
    )
}