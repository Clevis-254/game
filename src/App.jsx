import React from "react"
import { Banner } from "./Banner"
import { Play } from "./Pages/Play.jsx"
import { Routes, Route } from "react-router-dom"
import UserStats from "./UserStats.jsx";
import MyStats from "./MyStats.jsx";
import Login from "@/Login/login.jsx";
import "./styles/index.css";



const App = () => {
    return (
        <Routes>
            <Route path="/play" element={<Play />} />
            <Route path="/my-stats" element={<MyStats />} />
            <Route path="/user-stats" element={<UserStats />} />
            <Route path="/login" element={<Login />} />
        </Routes>
    )
}

export default App