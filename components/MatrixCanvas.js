"use client";

import { useEffect, useRef } from "react";

export default function MatrixCanvas() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
        const ctx = canvas.getContext("2d");

        const fontSize = 20;
        const columns = Math.floor(width / fontSize);
        const columnsState = Array(columns).fill(null);

        const getRandom = (min, max) =>
            Math.floor(Math.random() * (max - min + 1)) + min;

        function initializeColumn(columnIndex) {
            const isShort = Math.random() < 0.70;
            const minChars = 3;
            const maxChars = isShort ? 18 : 27;

            const length = getRandom(minChars, maxChars);
            const binarySet = Array.from({ length }, () =>
                Math.random() > 0.5 ? "1" : "0"
            );
            return {
                binarySet,
                currentRow: 0,
                completed: false,
                stayDuration: getRandom(2000, 3000),
                eraseTime: null,
                fadeStartTime: null,
                fadeOpacity: 1,
            };
        }

        function resetColumns() {
            for (let i = 0; i < columns; i++) {
                columnsState[i] = initializeColumn(i);
            }
        }

        resetColumns();

        function render() {
            // ctx.fillStyle = "black";
            ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--background');
            ctx.fillRect(0, 0, width, height);
            ctx.font = `${fontSize}px monospace`;

            for (let colIndex = 0; colIndex < columns; colIndex++) {
                const col = columnsState[colIndex];
                const xPos = colIndex * fontSize;

                if (!col.completed) {
                    ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
                    for (let row = 0; row <= col.currentRow; row++) {
                        const yPos = row * fontSize;
                        ctx.fillText(col.binarySet[row], xPos, yPos);
                    }

                    col.currentRow++;

                    if (col.currentRow >= col.binarySet.length) {
                        col.completed = true;
                        col.eraseTime = Date.now() + col.stayDuration;
                        col.fadeStartTime = col.eraseTime;
                    }
                } else {
                    const now = Date.now();

                    if (now >= col.fadeStartTime) {
                        const elapsed = now - col.fadeStartTime;
                        col.fadeOpacity = Math.max(1 - elapsed / 500, 0);

                        ctx.fillStyle = `rgba(0, 255, 0, ${col.fadeOpacity * 0.2})`;
                        for (let row = 0; row < col.binarySet.length; row++) {
                            const yPos = row * fontSize;
                            ctx.fillText(col.binarySet[row], xPos, yPos);
                        }

                        if (col.fadeOpacity <= 0) {
                            columnsState[colIndex] = initializeColumn(colIndex);
                        }
                    } else {
                        ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
                        for (let row = 0; row < col.binarySet.length; row++) {
                            const yPos = row * fontSize;
                            ctx.fillText(col.binarySet[row], xPos, yPos);
                        }
                    }
                }
            }
        }

        const interval = setInterval(render, 200);

        const resizeHandler = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            resetColumns();
        };

        window.addEventListener("resize", resizeHandler);

        return () => {
            clearInterval(interval);
            window.removeEventListener("resize", resizeHandler);
        };
    }, []);

    return <canvas ref={canvasRef} className="canvas"></canvas>;
}
