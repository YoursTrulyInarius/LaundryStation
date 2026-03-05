import { useState } from 'react';
import { Home, Users, PlusCircle, Receipt, LogOut, BarChart3 } from 'lucide-react';
import Dashboard from './components/Dashboard';
import CustomerList from './components/CustomerList';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import Reports from './components/Reports';
import Login from './components/Login';
import ReceiptComponent from './components/Receipt';

const API_BASE_URL = 'http://localhost:8000';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('home');
  const [printTransaction, setPrintTransaction] = useState(null);

  if (!currentUser) {
    return <Login apiBaseUrl={API_BASE_URL} onLogin={setCurrentUser} />;
  }

  const isAdmin = currentUser.role === 'Admin / Owner';

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTab('home');
  };

  const handlePrint = (transaction) => {
    setPrintTransaction(transaction);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return <Dashboard apiBaseUrl={API_BASE_URL} onNavigate={setCurrentTab} userRole={currentUser.role} />;
      case 'customers':
        return <CustomerList apiBaseUrl={API_BASE_URL} />;
      case 'new_transaction':
        if (isAdmin) return <Dashboard apiBaseUrl={API_BASE_URL} onNavigate={setCurrentTab} userRole={currentUser.role} />;
        return <TransactionForm apiBaseUrl={API_BASE_URL} onComplete={() => setCurrentTab('transactions')} onPrint={handlePrint} />;
      case 'transactions':
        return <TransactionList apiBaseUrl={API_BASE_URL} onPrint={handlePrint} />;
      case 'reports':
        if (!isAdmin) return <Dashboard apiBaseUrl={API_BASE_URL} onNavigate={setCurrentTab} userRole={currentUser.role} />;
        return <Reports apiBaseUrl={API_BASE_URL} />;
      default:
        return <Dashboard apiBaseUrl={API_BASE_URL} onNavigate={setCurrentTab} userRole={currentUser.role} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 w-full relative">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md z-10 sticky top-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <span className="text-xl">🧺</span>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">DingDong's</h1>
              <p className="text-[10px] text-indigo-200 uppercase tracking-widest">{isAdmin ? 'Admin Portal' : 'Staff Portal'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-indigo-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 p-4 w-full">
        {renderContent()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bg-white border-t border-gray-100 grid grid-cols-4 fixed bottom-0 max-w-[480px] w-full z-20 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.03)] h-16 print:hidden">
        <NavItem
          icon={<Home size={22} />}
          label="Home"
          isActive={currentTab === 'home'}
          onClick={() => setCurrentTab('home')}
        />
        <NavItem
          icon={<Users size={22} />}
          label="Customers"
          isActive={currentTab === 'customers'}
          onClick={() => setCurrentTab('customers')}
        />

        {/* Staff Only: Quick Add - Integrated flush with bar */}
        {!isAdmin ? (
          <button
            onClick={() => setCurrentTab('new_transaction')}
            className={`flex flex-col items-center justify-center relative transition-all ${currentTab === 'new_transaction' ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${currentTab === 'new_transaction' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110' : 'bg-gray-100 text-gray-500'}`}>
              <PlusCircle size={22} />
            </div>
            <span className={`text-[10px] font-bold mt-1 tracking-tight ${currentTab === 'new_transaction' ? 'opacity-100' : 'opacity-60'}`}>
              New
            </span>
          </button>
        ) : (
          <NavItem
            icon={<Receipt size={22} />}
            label="Orders"
            isActive={currentTab === 'transactions'}
            onClick={() => setCurrentTab('transactions')}
          />
        )}

        {isAdmin ? (
          <NavItem
            icon={<BarChart3 size={22} />}
            label="Reports"
            isActive={currentTab === 'reports'}
            onClick={() => setCurrentTab('reports')}
          />
        ) : (
          <NavItem
            icon={<Receipt size={22} />}
            label="Orders"
            isActive={currentTab === 'transactions'}
            onClick={() => setCurrentTab('transactions')}
          />
        )}
      </nav>

      {/* Print Overlay / Modal */}
      {printTransaction && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static print:z-0">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative print:p-0 print:max-h-none print:w-full print:rounded-none shadow-2xl">
            <button
              onClick={() => setPrintTransaction(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors print:hidden"
            >
              <LogOut size={20} className="rotate-90" />
            </button>
            <ReceiptComponent transaction={printTransaction} />
            <div className="mt-6 flex gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-100 active:bg-indigo-700 transition-all flex justify-center items-center gap-2"
              >
                <PlusCircle size={20} className="rotate-45" /> Print Receipt
              </button>
              <button
                onClick={() => setPrintTransaction(null)}
                className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl active:bg-gray-200 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center py-3 relative transition-all ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}
    >
      <div className={`mb-1 transition-transform duration-300 ${isActive ? '-translate-y-0.5' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold tracking-tight transition-opacity ${isActive ? 'opacity-100' : 'opacity-60'}`}>
        {label}
      </span>
      {isActive && (
        <div className="absolute bottom-1 w-1 h-1 bg-indigo-600 rounded-full animate-fade-in" />
      )}
    </button>
  );
}

export default App;
