// src/hooks/useScramble.ts

import { useState, useEffect, useRef } from 'react';

export const useScramble = (text: string) => {
  const [currentText, setCurrentText] = useState(text);
  const chars = '!<>-_\\/[]{}—=+*^?#________';
  const frameRequest = useRef<number>();
  const frame = useRef<number>(0);
  const queue = useRef<{ from: string; to: string; start: number; end: number, char?: string }[]>([]);

  useEffect(() => {
    const oldText = currentText;
    const newText = text;
    const length = Math.max(oldText.length, newText.length);
    
    const updateQueue = () => {
      queue.current = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 40);
        const end = start + Math.floor(Math.random() * 40);
        queue.current.push({ from, to, start, end });
      }
    };
    
    updateQueue();
    cancelAnimationFrame(frameRequest.current!);
    frame.current = 0;
    
    const updateAnimation = () => {
      let output = '';
      let complete = 0;
      for (let i = 0, n = queue.current.length; i < n; i++) {
        let { from, to, start, end, char } = queue.current[i];
        if (frame.current >= end) {
          complete++;
          output += to;
        } else if (frame.current >= start) {
          if (!char || Math.random() < 0.28) {
            char = chars[Math.floor(Math.random() * chars.length)];
            queue.current[i].char = char;
          }
          output += `<span class="text-signodes-400/50">${char}</span>`;
        } else {
          output += from;
        }
      }
      setCurrentText(output);
      if (complete === queue.current.length) {
        // Animation finished
      } else {
        frameRequest.current = requestAnimationFrame(updateAnimation);
        frame.current++;
      }
    };

    requestAnimationFrame(updateAnimation);

    return () => {
      cancelAnimationFrame(frameRequest.current!);
    };
  }, [text]);

  return { scrambledText: currentText };
};