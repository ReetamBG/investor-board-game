import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";

type CardType = "startup" | "event" | "result";

type CardRevealProps = {
  cardType: CardType;
  card: { id: string };
  playerName: string;
  investment?: { title: string; amount: number };
  resolve: (value?: any) => void;
};

const FRONT_PATHS: Record<CardType, string> = {
  startup: "/cards/startup_card_front.svg",
  event: "/cards/event_card_front.svg",
  result: "/cards/result_card_front.svg",
};

type Phase = "entering" | "flipping" | "showing" | "exiting";

export default function CardReveal({
  cardType,
  card,
  playerName,
  investment,
  resolve,
}: CardRevealProps) {
  const [phase, setPhase] = useState<Phase>("entering");
  const [isFlipped, setIsFlipped] = useState(false);
  const investRef = useRef<boolean | null>(null);

  const backPath = `/cards/${card.id}.svg`;
  const frontPath = FRONT_PATHS[cardType];

  useEffect(() => {
    if (phase === "entering") {
      const t = setTimeout(() => {
        setPhase("flipping");
        setIsFlipped(true);
      }, 450);
      return () => clearTimeout(t);
    }
    if (phase === "flipping") {
      const t = setTimeout(() => setPhase("showing"), 650);
      return () => clearTimeout(t);
    }
    if (phase === "exiting") {
      const t = setTimeout(() => {
        if (cardType === "startup" && investRef.current !== null) {
          resolve(investRef.current);
        } else {
          resolve();
        }
      }, 400);
      return () => clearTimeout(t);
    }
  }, [phase, cardType, resolve]);

  const dismiss = useCallback(() => {
    if (phase !== "showing") return;
    setPhase("exiting");
  }, [phase]);

  const handleInvest = useCallback(
    (invest: boolean, e: React.MouseEvent) => {
      e.stopPropagation();
      investRef.current = invest;
      dismiss();
    },
    [dismiss],
  );

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Card */}
      <motion.div
        className={`relative z-10 ${cardType !== "startup" && phase === "showing" ? "cursor-pointer" : ""}`}
        onClick={cardType !== "startup" && phase === "showing" ? dismiss : undefined}
        style={{ perspective: 1200 }}
        initial={{ scale: 0.2, opacity: 0 }}
        animate={{
          scale: phase === "exiting" ? 0.5 : 1,
          opacity: phase === "exiting" ? 0 : 1,
          y: phase === "exiting" ? -120 : 0,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* 3D flip container */}
        <motion.div
          className="relative w-72 h-[400px]"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl border-2 border-stone-800"
            style={{ backfaceVisibility: "hidden" }}
          >
            <img
              src={frontPath}
              alt="Card front"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden border-2 border-stone-800 shadow-2xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <img
              src={backPath}
              alt="Card back"
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>

        {/* Player + startup name — result cards only */}
      {cardType === "result" && investment && phase !== "exiting" && (
        <motion.div
          className="absolute -top-14 left-0 right-0 flex flex-col items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-stone-200 backdrop-blur">
            {playerName}
          </span>
          <span className="rounded-full bg-white/10 px-4 py-1 text-xs text-stone-300 backdrop-blur">
            {investment.title}
          </span>
        </motion.div>
      )}

      {/* Invest buttons — startup only */}
        {cardType === "startup" && phase === "showing" && (
          <motion.div
            className="absolute -top-14 left-0 right-0 flex justify-center gap-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.25 }}
          >
            <button
              onClick={(e) => handleInvest(true, e)}
              className="rounded-sm bg-yellow-300 px-5 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-yellow-500 hover:cursor-pointer"
            >
              Yes, Invest
            </button>
            <button
              onClick={(e) => handleInvest(false, e)}
              className="rounded-sm bg-teal-500 px-5 py-2 text-sm font-semibold text-black shadow-lg transition hover:bg-teal-700 hover:cursor-pointer"
            >
              Don't Invest
            </button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
