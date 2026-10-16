import React, { useContext } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Home from "./pages/home.jsx";
import Profile from "./pages/Profile.jsx";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext.jsx";
import bgImage from "./assets/bgImage.svg";

function App() {
  const { authUser } = useContext(AuthContext);

  return (
    <div
 className="bg-cover bg-center bg-no-repeat min-h-screen"
  style={{ backgroundImage: `url(${bgImage})` }}
>
      <Toaster/>
      <Routes>
        <Route path="/" element={authUser ? <Home /> : <Navigate to="/login"/>} />
        <Route path="/login" element={!authUser ? <Login /> : <Navigate to="/"/>} />
        <Route path="/profile" element={authUser ? <Profile /> : <Navigate to="/login"/>} />
      </Routes>
    </div>
  );
}

export default App;