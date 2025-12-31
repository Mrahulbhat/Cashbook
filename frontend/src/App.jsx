import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import HomePage from "./pages/HomePage";
import { Routes, Route, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import AddTransaction from "./pages/AddTransaction";
import EditTransaction from "./pages/EditTransaction";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import AddAccount from "./pages/AddAccount";
import EditAccount from "./pages/EditAccount";
import Categories from "./pages/Categories";
import AddCategory from "./pages/AddCategory";
import Statistics from "./pages/Statistics";
import Transactions from "./pages/Transactions";
import Transfer from "./pages/Transfer";

const App = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

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

  // Show sidebar only on dashboard and management pages (not on homepage)
  const showSidebar = location.pathname !== "/";

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex h-[90vh] bg-black">
        {showSidebar && <Sidebar />}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/accounts" element={<Accounts />} />
            <Route path="/addAccount" element={<AddAccount />} />
            <Route path="/edit-account/:id" element={<EditAccount />} />

            <Route path="/categories" element={<Categories />} />
            <Route path="/addCategory" element={<AddCategory />} />
            {/* create one for edit Category */}

            <Route path="/transactions" element={<Transactions />} />
            <Route path="/addTransaction" element={<AddTransaction />} />
            <Route path="/edit-transaction/:id" element={<EditTransaction />} />

            <Route path="/transfer" element={<Transfer />} />
            <Route path='/stats' element={<Statistics />} />

          </Routes>
          <Toaster />
        </div>
      </div>
    </div>
  );
};

export default App;
