import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Split from "react-split";
import dynamic from "next/dynamic";
import styles from "../styles/Home.module.css";
import MarkdownPanel from "../components/MarkdownPanel";
import Button from "../components/ui/Button";

const TerminalPanel = dynamic(() => import("../components/TerminalPanel"), {
  ssr: false,
});
export default function Home() {
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState(null);
  const router = useRouter();

  const handleStart = async () => {
    try {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        alert("Not logged in!");
        return;
      }
      const userData = JSON.parse(savedToken);
      const res = await fetch("/api/validate-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        name: userData.name,
      }),
    });
      console.log("localStorage token raw:", localStorage.getItem("token"));

      const data = await res.json();
      console.log("Validate-user response:", data);

      if (data.success) {
        setConnected(true);   // ✅ baru connect websocket
      } else {
        alert("User validation failed: " + data.message);
      }
    } catch (err) {
      console.log("Error validating user:", err);
      alert("Server error while validating user.", err);
    }
  };


  useEffect(() => {
    const savedToken = localStorage.getItem("token");
   // if (savedToken) setToken(savedToken);
    if (!savedToken) {
      router.replace("/login"); // kalau tidak ada token, paksa ke login
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    router.push("/login");
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="flex justify-between items-center px-6 py-4 border-b bg-white">
        <h1 className="text-xl font-bold text-blue-900">ADINUSA</h1>
        <nav className="flex items-center space-x-6">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Shop
          </a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
            Newsstand
          </a>

          {token ? (
            <>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/profile");
                }}
              >
                My profile
              </a>
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-500"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 rounded-lg font-medium bg-blue-900 text-white hover:bg-blue-800"
            >
              Login
            </button>
          )}
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
            <button onClick={handleStart} disabled={connected}>
              Start
            </button>
            <button className="btn-grade">Grade</button>
          </div>
            <div className="flex-1 bg-gray-300">
              <TerminalPanel connected={connected} />
            </div>
          </div>
        </Split>
      </div>
    </div>
  );
}
