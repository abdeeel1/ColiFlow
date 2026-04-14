import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
    return ( 

    <div className="flex flex-col min-h-screen bg-[#F1F5F9]">

        <Navbar />

        <main className="grow container mx-auto p-6">

            <Outlet />

        </main>

        <Footer />

    </div>
    
    
    
    );
}
 
export default Layout;