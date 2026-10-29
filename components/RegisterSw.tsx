"use client";

import { useEffect } from "react";

export default function RegisterSw() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("Service worker failed", err));
    }
  }, []);
  return null;
}
