import { useEffect } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";
import "@xterm/xterm/css/xterm.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    // Kalau user buka root "/", arahkan ke /login
    if (router.pathname === "/") {
      router.replace("/login");
    }
  }, [router]);

  return <Component {...pageProps} />;
}
