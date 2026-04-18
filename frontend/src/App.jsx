import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LoanForm from "./pages/LoanForm";
import Result from "./pages/Result";
import AddTransaction from "./pages/AddTransaction";
import LoanPredict from "./pages/Loanpredict";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/loan" element={<LoanForm />} />
        <Route path="/result" element={<Result />} />
        <Route path="/add-transaction" element={<AddTransaction />} />
        <Route path="/loanpredict" element={<LoanPredict />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;