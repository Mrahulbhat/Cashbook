import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import { Routes, Route } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import AddTransaction from "./pages/AddTransaction";
import Dashboard from "./pages/Dashboard";
import AddAccount from "./pages/AddAccount";
import AddCategory from "./pages/AddCategory";

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen">
      <Navbar />
      <div className="h-[90vh] bg-black">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/addTransaction" element={<AddTransaction />} />
          <Route path="/addAccount" element={<AddAccount />} />
          <Route path="/addCategory" element={<AddCategory />} />
        </Routes>
        <Toaster />
      </div>
      {/* <div className="hidden md:block">
      <Footer/>
      </div> */}
    </div>
  );
};

export default App;
