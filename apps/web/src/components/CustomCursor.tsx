"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const trailPos = useRef({ x: -100, y: -100 });
  const visible = useRef(false);

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    if (!cursor || !trail) return;

    const onMouseMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!visible.current) {
        visible.current = true;
        cursor.style.opacity = "1";
        trail.style.opacity = "1";
      }
    };

    const onMouseLeave = () => {
      visible.current = false;
      cursor.style.opacity = "0";
      trail.style.opacity = "0";
    };

    const onMouseDown = () => {
      cursor.style.transform = "translate(-50%, -50%) scale(0.75)";
      trail.style.transform = "translate(-50%, -50%) scale(0.6)";
    };

    const onMouseUp = () => {
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
      trail.style.transform = "translate(-50%, -50%) scale(1)";
    };

    let rafId: number;
    const animate = () => {
      // Smooth trailing effect
      trailPos.current.x += (pos.current.x - trailPos.current.x) * 0.15;
      trailPos.current.y += (pos.current.y - trailPos.current.y) * 0.15;

      cursor.style.left = `${pos.current.x}px`;
      cursor.style.top = `${pos.current.y}px`;
      trail.style.left = `${trailPos.current.x}px`;
      trail.style.top = `${trailPos.current.y}px`;

      rafId = requestAnimationFrame(animate);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    rafId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      {/* Outer trail ring */}
      <div
        ref={trailRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "1.5px solid rgba(220, 38, 38, 0.5)",
          pointerEvents: "none",
          zIndex: 99999,
          transform: "translate(-50%, -50%)",
          opacity: 0,
          transition: "transform 0.2s ease, opacity 0.3s ease",
          mixBlendMode: "screen",
        }}
      />
      {/* Inner solid dot */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "radial-gradient(circle, #ef4444 0%, #dc2626 60%, #b91c1c 100%)",
          boxShadow: "0 0 8px 2px rgba(239, 68, 68, 0.45), 0 0 20px 4px rgba(220, 38, 38, 0.2)",
          pointerEvents: "none",
          zIndex: 100000,
          transform: "translate(-50%, -50%)",
          opacity: 0,
          transition: "transform 0.15s ease, opacity 0.3s ease",
        }}
      />
    </>
  );
}
