import React from 'react';
import TTSSettings from "./TTSSettings.jsx";
import AudioSettings from './AudioSettings.jsx';
import Banner from "../Banner.jsx";

export default function SettingsPage() {
  return (
    <>
    <Banner />
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <AudioSettings />
      <TTSSettings />
    </div>
    </>
  );
}
