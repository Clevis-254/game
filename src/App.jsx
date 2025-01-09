import { Play } from "./Pages/Play/Play.jsx";
import {Routes, Route } from "react-router-dom"
import UserStats from "./Pages/UserStats/UserStats.jsx";
import MyStats from "./Pages/MyStats/MyStats.jsx";
import Login from "@/Pages/Login/login.jsx";
import SignUp from "@/SignUp/SignUp.jsx";
import SettingsPage from "./Pages/Settings/SettingsPage.jsx";
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import { Error404 } from "./Errors/Error404.jsx";
import Dashboard from "./Admin/dashboard.jsx";
const App = () => {
    return (
        <Routes>
            <Route path="/play" element={<Play />} />
            <Route path="/my-stats" element={<MyStats />} />
            <Route path="/user-stats" element={<UserStats />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<Dashboard/>} />
            <Route path="/404" element={<Error404 />} />
        </Routes>
    )
}

export default App