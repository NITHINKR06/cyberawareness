import { useEffect, useRef } from 'react';

// Matrix style falling characters animation (cmatrix like)
// This component creates a full‑screen canvas with green characters falling down.
// It is lightweight and works without external dependencies.

const MatrixBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        const letters = 'アァカサタナハマヤラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨロヲゴゾドボポ'.split('');
        const fontSize = 16;
        const columns = Math.floor(canvas.width / fontSize);
        const drops: number[] = Array(columns).fill(0);

        const draw = () => {
            // Fade the background a bit each frame to create trailing effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#cbd5e1'; // green characters
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;
                ctx.fillText(text, x, y);
                // Reset drop after it reaches bottom or randomly
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        let animationFrameId: number;
        const loop = () => {
            draw();
            animationFrameId = requestAnimationFrame(loop);
        };
        loop();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', setCanvasSize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
        />
    );
};

export default MatrixBackground;
