"use client";

import React, { useEffect, useRef } from "react";

interface VadamvaliCanvasProps {
  ropePosition: number; // -100 (Player 1 win) to +100 (Player 2 win), 0 is center
  isPullingP1: boolean;
  isPullingP2: boolean;
  player1Name: string;
  player2Name: string;
}

export function VadamvaliCanvas({
  ropePosition,
  isPullingP1,
  isPullingP2,
  player1Name,
  player2Name,
}: VadamvaliCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw Arena Floor (Sand / Kerala festival ground)
      const floorY = height * 0.72;

      // Ground gradient
      const groundGrad = ctx.createLinearGradient(0, floorY, 0, height);
      groundGrad.addColorStop(0, "#78350f"); // warm dirt
      groundGrad.addColorStop(1, "#451a03");
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, floorY, width, height - floorY);

      // Center Line Marker (Kerala traditional white chalk line)
      const centerX = width / 2;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 4;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(centerX, floorY - 60);
      ctx.lineTo(centerX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Win threshold boundary lines
      const winOffset = width * 0.32;
      ctx.strokeStyle = "rgba(239, 68, 68, 0.5)"; // Red win boundary
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - winOffset, floorY - 40);
      ctx.lineTo(centerX - winOffset, height);
      ctx.moveTo(centerX + winOffset, floorY - 40);
      ctx.lineTo(centerX + winOffset, height);
      ctx.stroke();

      // 2. Compute Dynamic Rope Offset from ropePosition (-100 to +100)
      const ropeShift = (ropePosition / 100) * winOffset;
      const ropeY = floorY - 30;

      // Draw Main Heavy Coir Rope (Thick jute texture)
      ctx.save();
      ctx.strokeStyle = "#d97706"; // golden coir rope
      ctx.lineWidth = 14;
      ctx.lineCap = "round";

      // Curved wavy rope physics
      ctx.beginPath();
      const p1HandX = centerX - 180 + ropeShift;
      const p2HandX = centerX + 180 + ropeShift;

      ctx.moveTo(0, ropeY + Math.sin(time * 2) * 2);
      ctx.quadraticCurveTo(
        centerX + ropeShift,
        ropeY + Math.sin(time * 3) * 6,
        width,
        ropeY + Math.cos(time * 2) * 2
      );
      ctx.stroke();

      // Rope Texture Ridges
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 20; x < width - 20; x += 15) {
        ctx.moveTo(x, ropeY - 6);
        ctx.lineTo(x + 6, ropeY + 6);
      }
      ctx.stroke();
      ctx.restore();

      // 3. Center Red Festive Flag / Ribbon on the rope
      const flagX = centerX + ropeShift;
      const flagY = ropeY;

      ctx.save();
      // Flag knot
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(flagX, flagY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Hanging decorative ribbon
      ctx.beginPath();
      ctx.moveTo(flagX, flagY);
      ctx.quadraticCurveTo(flagX + 15 * Math.sin(time * 4), flagY + 25, flagX + 8, flagY + 45);
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#ef4444";
      ctx.stroke();
      ctx.restore();

      // 4. Draw Player 1 Team (Left: Kerala Maveli Warriors in Kasavu/Green)
      const drawPlayer1 = (x: number, y: number, isPulling: boolean) => {
        ctx.save();
        const lean = isPulling ? -0.35 : -0.15; // Leaning back hard
        ctx.translate(x, y);
        ctx.rotate(lean);

        // Legs (braced stance)
        ctx.strokeStyle = "#047857";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(-30, 45);
        ctx.moveTo(10, 0);
        ctx.lineTo(-5, 45);
        ctx.stroke();

        // Torso
        ctx.fillStyle = "#064e3b";
        ctx.fillRect(-15, -45, 30, 45);

        // Golden Kasavu Border Sash
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(-15, -25, 30, 8);

        // Arms gripping rope
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, -35);
        ctx.lineTo(25, -15);
        ctx.stroke();

        // Head & Festive Headband
        ctx.fillStyle = "#fed7aa";
        ctx.beginPath();
        ctx.arc(0, -60, 16, 0, Math.PI * 2);
        ctx.fill();

        // Headband
        ctx.fillStyle = "#ea580c";
        ctx.fillRect(-16, -68, 32, 7);

        ctx.restore();
      };

      // 5. Draw Player 2 Team (Right: Royal Tiger Warriors in Gold/Crimson)
      const drawPlayer2 = (x: number, y: number, isPulling: boolean) => {
        ctx.save();
        const lean = isPulling ? 0.35 : 0.15; // Leaning back right
        ctx.translate(x, y);
        ctx.rotate(lean);

        // Legs
        ctx.strokeStyle = "#b91c1c";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(15, 0);
        ctx.lineTo(30, 45);
        ctx.moveTo(-10, 0);
        ctx.lineTo(5, 45);
        ctx.stroke();

        // Torso
        ctx.fillStyle = "#7f1d1d";
        ctx.fillRect(-15, -45, 30, 45);

        // Golden Belt
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(-15, -25, 30, 8);

        // Arms
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(0, -35);
        ctx.lineTo(-25, -15);
        ctx.stroke();

        // Head
        ctx.fillStyle = "#fed7aa";
        ctx.beginPath();
        ctx.arc(0, -60, 16, 0, Math.PI * 2);
        ctx.fill();

        // Crimson Band
        ctx.fillStyle = "#b91c1c";
        ctx.fillRect(-16, -68, 32, 7);

        ctx.restore();
      };

      // Render Warriors
      drawPlayer1(centerX - 160 + ropeShift, floorY - 5, isPullingP1);
      drawPlayer1(centerX - 240 + ropeShift, floorY - 5, isPullingP1);

      drawPlayer2(centerX + 160 + ropeShift, floorY - 5, isPullingP2);
      drawPlayer2(centerX + 240 + ropeShift, floorY - 5, isPullingP2);

      // 6. Dust Particles on heavy pulls
      if (isPullingP1 || isPullingP2) {
        ctx.fillStyle = "rgba(245, 158, 11, 0.4)";
        for (let i = 0; i < 6; i++) {
          const px = isPullingP1 ? centerX - 180 + ropeShift : centerX + 180 + ropeShift;
          ctx.beginPath();
          ctx.arc(
            px + (Math.random() - 0.5) * 40,
            floorY + Math.random() * 15,
            Math.random() * 4 + 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [ropePosition, isPullingP1, isPullingP2]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass-panel border border-amber-500/30 shadow-2xl bg-slate-950">
      <canvas
        ref={canvasRef}
        width={800}
        height={320}
        className="w-full h-auto block"
      />
    </div>
  );
}
