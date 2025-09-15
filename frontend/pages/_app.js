import { useEffect } from "react";
import { useRouter } from "next/router";
import "../styles/globals.css";
import "@xterm/xterm/css/xterm.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}