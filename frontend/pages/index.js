// pages/index.js
import Split from "react-split";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import styles from "../styles/Home.module.css";
import MarkdownPanel from "../components/MarkdownPanel";
import Button from "../components/ui/Button";


const TerminalPanel = dynamic(() => import("../components/TerminalPanel"), {
  ssr: false,
});
export default function Home() {
    const [connected, setConnected] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b bg-white">
        <h1 className="text-xl font-bold text-blue-900">ADINUSA</h1>
        <nav className="flex items-center space-x-6">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Shop</a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Newsstand</a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">My profile</a>
          <button className="px-4 py-2 rounded-lg font-medium bg-blue-900 text-white hover:bg-blue-800">
            Next
          </button>
        </nav>
      </header>

      <div className="flex-1">
        <Split
          className={styles.split}  // pakai CSS module
          direction="horizontal"
          sizes={[50, 50]}
          minSize={200}
          gutterSize={8}
        >
          {/* Left & Right Panel */}
          <div className="h-full overflow-auto bg-white p-6 prose max-w-none">
            <MarkdownPanel />
          </div>
          
          <div className="h-full overflow-auto bg-gray-100 flex flex-col">
          <div className="flex justify-end space-x-4 p-4 bg-gray-100">
            <button className="btn-start">Start</button>
            <button className="btn-grade">Grade</button>
          </div>
            <div className="flex-1 bg-gray-300">
              <TerminalPanel />
            </div>
          </div>
        </Split>
      </div>
    </div>
  );
}
