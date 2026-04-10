import { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";
import {
  playSaleDing,
  playKaChing,
  playError,
  playAlert,
  playClick,
  playGameOver,
  playMailNotif,
} from "../systems/sound";

/**
 * Subscribes to store changes and plays appropriate sounds.
 * Mount once in App.tsx.
 */
export function useSoundEffects(): void {
  const prevEventCount = useRef(0);
  const prevMailCount = useRef(0);
  const prevGameOver = useRef(false);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state, prev) => {
      // New events since last tick
      if (state.events.length > prev.events.length) {
        const newEvents = state.events.slice(prev.events.length);
        for (const e of newEvents) {
          const msg = e.message.toLowerCase();

          if (e.level === "good" && msg.includes("sold")) {
            // Check if it's a big sale
            const priceMatch = e.message.match(/\$(\d+)/);
            const price = priceMatch ? parseInt(priceMatch[1]) : 0;
            if (price >= 50) {
              playKaChing();
            } else {
              playSaleDing();
            }
          } else if (e.level === "warning" && (msg.includes("error") || msg.includes("accident"))) {
            playError();
          } else if (e.level === "danger") {
            playAlert();
          } else if (e.level === "good" && (msg.includes("sourced") || msg.includes("hired"))) {
            playClick();
          } else if (e.level === "warning" && msg.includes("heat")) {
            playAlert();
          }
        }
      }

      // New mail
      if (state.mails.length > prev.mails.length) {
        playMailNotif();
      }

      // Game over
      if (state.gameOver && !prev.gameOver) {
        playGameOver();
      }
    });

    // Initialize refs
    const initial = useGameStore.getState();
    prevEventCount.current = initial.events.length;
    prevMailCount.current = initial.mails.length;
    prevGameOver.current = initial.gameOver;

    return unsub;
  }, []);
}
