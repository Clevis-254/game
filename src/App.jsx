import React from "react"
import { Banner } from "./Banner"
import { Play } from "./Play"
import { Routes, Route } from "react-router-dom"
import UserStats from "./UserStats.jsx";
import MyStats from "./MyStats.jsx";



const App = () => {
    return (
        <Routes>
            <Route path="/play" element={<Play />} />
            <Route path="/my-stats" element={<MyStats />} />
            <Route path="/user-stats" element={<UserStats />} />
        </Routes>
    )
}

export default App