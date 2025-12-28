import { ArrowRight, Wallet, TrendingUp, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-green-400/5 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full p-6 sm:p-12 flex flex-col items-center justify-center">
        <div className="mt-[10vh] sm:mt-[15vh] text-white text-center max-w-4xl mx-auto">
          
          {/* Main heading with enhanced typography */}
          <div className="space-y-6 mb-12">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-green-100 to-white bg-clip-text text-transparent leading-tight">
              Welcome to 
              <span className="block bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent animate-pulse">
                Cashbook
              </span>
            </h1>
            
            <h2 className="mt-8 text-lg sm:text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto font-light">
              Manage your finances, track transactions, and control your spending in one place
            </h2>
          </div>

          {/* Feature highlights */}
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-green-500/30 transition-all duration-300 hover:scale-105">
              <Wallet className="w-8 h-8 text-green-400 mx-auto mb-3 group-hover:rotate-12 transition-transform duration-300" />
              <h3 className="text-white font-semibold mb-2">Multiple Accounts</h3>
              <p className="text-gray-400 text-sm">Manage all your accounts in one dashboard</p>
            </div>
            
            <div className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-emerald-500/30 transition-all duration-300 hover:scale-105 delay-100">
              <DollarSign className="w-8 h-8 text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-white font-semibold mb-2">Track Transactions</h3>
              <p className="text-gray-400 text-sm">Record income and expenses with categories</p>
            </div>
            
            <div className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-teal-500/30 transition-all duration-300 hover:scale-105 delay-200">
              <TrendingUp className="w-8 h-8 text-teal-400 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-white font-semibold mb-2">Smart Analytics</h3>
              <p className="text-gray-400 text-sm">Visualize spending patterns and insights</p>
            </div>
          </div>

          {/* CTA Button with enhanced styling */}
          <div className="flex justify-center">
            <button
              datatest="button-getStarted"
              onClick={() => navigate("/dashboard")}
              className="group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold px-10 py-4 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 border border-green-500/20"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300 -z-10"></div>
              
              <span className="flex items-center gap-3 relative z-10">
                Get Started
                <ArrowRight 
                  size={20} 
                  className="group-hover:translate-x-1 transition-transform duration-300" 
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/30 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400/40 rounded-full animate-ping delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-blue-300/20 rounded-full animate-ping delay-3000"></div>
      </div>
    </div>
  );
};

export default HomePage;