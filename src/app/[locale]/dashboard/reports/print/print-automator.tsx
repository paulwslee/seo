"use client";

import { useEffect } from "react";

export function PrintAutomator() {
  useEffect(() => {
    // Wait for images to load, then trigger print
    const timer = setTimeout(() => {
      window.print();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
