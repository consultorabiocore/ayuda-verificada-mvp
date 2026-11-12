"use client";
import { useEffect } from "react";
import { initDemo } from "@/lib/demo-db";

export function DemoInit() {
  useEffect(() => {
    initDemo();
  }, []);
  return null;
}