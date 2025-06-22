import { ThemeProvider } from "@/components/themeProvider";
import { Outlet } from "react-router-dom";
import ThemeToggle from "@/components/themeToggle";
import { Bounce, ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import Navbar from "./components/navbar";

function Layout() {
  const [currentTheme, setCurrentTheme] = useState("");

  useEffect(() => {
    console.log(`currentTheme: ${currentTheme}`);
  }, [currentTheme]);

  return (
    <>
      <Navbar />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ToastContainer
          position="top-right"
          autoClose={5000}
          limit={8}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={currentTheme}
          transition={Bounce}
        />
        <div className="fixed bottom-2 right-2">
          <ThemeToggle setCurrentTheme={setCurrentTheme} />
        </div>
        <Outlet />
      </ThemeProvider>
    </>
  );
}

export default Layout;
