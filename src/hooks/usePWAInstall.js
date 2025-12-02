import { useEffect, useState } from "react";

export default function usePWAInstall() {
  const [promptEvent, setPromptEvent] = useState(null);

  useEffect(() => {
    const ready = (e) => {
      e.preventDefault();
      setPromptEvent(e);
    };

    window.addEventListener("beforeinstallprompt", ready);

    return () => window.removeEventListener("beforeinstallprompt", ready);
  }, []);

  const instalar = async () => {
    if (!promptEvent) return;

    promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    return choice.outcome; // "accepted" | "dismissed"
  };

  return {
    instalar,
    puedeInstalar: !!promptEvent,
  };
}
