import React, { useState, useEffect } from "react";
import { Banner } from "../Banner.jsx";

export function UserStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/site/stats", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch stats.");
                }

                const data = await response.json();
                setStats(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <p>Loading stats...</p>;
    }

    if (error) {
        return <p>Error loading stats: {error}</p>;
    }

    return (
        <>
            <Banner />
            <h1 style={{textAlign: "center"}}>User Stats</h1>
            <hr/>
            <br/>

            <div className="statsContainer">
                <div className="timePlayed">
                    <h2 className="text-uppercase">Seconds Played</h2>
                    <h4>{stats.stats.totalTimePlayed}</h4>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSection">
                    <h2 className="text-uppercase">Number of Players</h2>
                    <h4>{stats.totalUsers}</h4>
                </div>

                <div className="statSection">
                    <h2 className="text-uppercase">Most Active Player</h2>
                    <h4 className="text-uppercase">{stats.mostPlayed.name} | {stats.mostPlayed.timePlayed}</h4>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSection">
                    <h2 className="text-uppercase">Total Game Completions</h2>
                    <h4>{stats.stats.totalGameCompletions}</h4>
                </div>

                <div className="statSection">
                    <h2 className="text-uppercase">Total Deaths</h2>
                    <h4>{stats.stats.totalNumberOfDeaths}</h4>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSection">
                    <h2 className="text-uppercase">Riddle Guesses: {stats.stats.totalRiddleGuesses}</h2>
                    <h2 className="text-success">Correct: {stats.stats.totalRiddleGuessesCorrect}</h2>
                    <h2 className="text-danger">Incorrect: {stats.stats.totalRiddleGuessesIncorrect}</h2>
                </div>
                <div className="statSection">
                    <h2 className="text-uppercase">Forest Path Choices: {stats.stats.totalPathChoices}</h2>
                    <h2>Chose to Fight: {stats.stats.totalPathChoicesLeft}</h2>
                    <h2>Chose to Traverse: {stats.stats.totalPathChoicesRight}</h2>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSection">
                    <h2 className="text-uppercase">Audio Files Played</h2>
                    <h4>{stats.stats.totalAudioPlayed}</h4>
                </div>

                <div className="statSection">
                    <h2 className="text-uppercase">Commands Used</h2>
                    <h4>{stats.stats.totalCommandsUsed}</h4>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSection">
                    <h2 className="text-uppercase">Audio File Play Count</h2>
                    <h4>hit: {stats.stats.totalHit}</h4>
                    <h4>miss: {stats.stats.totalMiss}</h4>
                    <h4>damaged: {stats.stats.totalDamaged}</h4>
                    <h4>stamina: {stats.stats.totalStamina}</h4>
                    <h4>eating: {stats.stats.totalEating}</h4>
                    <h4>death: {stats.stats.totalDeath}</h4>
                </div>

                <div className="statSection">
                    <h2 className="text-uppercase">Command Usage</h2>
                    <h4>Start Game: {stats.stats.totalStartGame}</h4>
                    <h4>Repeat: {stats.stats.totalRepeat}</h4>
                    <h4>Pause: {stats.stats.totalPause}</h4>
                    <h4>End Game: {stats.stats.totalEndGame}</h4>
                    <h4>Speed Up: {stats.stats.totalSpeedUp}</h4>
                    <h4>Slow Down: {stats.stats.totalSlowDown}</h4>
                    <h4>Restart: {stats.stats.totalRestart}</h4>
                    <h4>Clear: {stats.stats.totalClear}</h4>
                    <h4>Rewind: {stats.stats.totalRewind}</h4>
                    <h4>Help: {stats.stats.totalHelp}</h4>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSectionHeatmap">
                    <h1 className="text-uppercase">Heatmap</h1>
                    <img
                        src="https://talos-interactive.com/wp-content/uploads/2022/04/GameTelemetryGallery05-1024x576.jpg"/>
                </div>
            </div>
        </>
    );
}

export default UserStats;