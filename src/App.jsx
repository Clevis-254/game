import React from "react"
import { Play } from "./Pages/Play/Play.jsx";
import { Routes, Route } from "react-router-dom"
import UserStats from "./Pages/UserStats/UserStats.jsx";
import MyStats from "./Pages/MyStats/MyStats.jsx";
import Login from "@/Pages/Login/login.jsx";
import SignUp from "@/SignUp/SignUp.jsx";


const App = () => {
    return (
        <Routes>
            <Route path="/play" element={<Play />} />
            <Route path="/my-stats" element={<MyStats />} />
            <Route path="/user-stats" element={<UserStats />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
        </Routes>
    )
}

export default App