import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white">
      <div className="text-center">

        <h1 className="text-5xl font-bold mb-6">
          Axcel Wallet
        </h1>

        <a
          href="/login"
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
        >
          Login
        </a>

      </div>
    </div>
  )
}

function App() {

  const { user, loading } = useAuth() as any

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] text-blue-500">
        Loading...
      </div>
    )
  }

  return (

    <Routes>

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={
          user
            ? <Navigate to="/dashboard" replace />
            : <Login />
        }
      />

      <Route
        path="/dashboard"
        element={
          user
            ? <Dashboard />
            : <Navigate to="/login" replace />
        }
      />

    </Routes>

  )
}

export default App
