import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StartupCard } from "@/game/gameLogic";
import { formatCash, type GamePlayer } from "@/game/gameLogic";

export type PendingDialog =
  | { kind: "alert"; title: string; description?: string }
  | {
      kind: "bailout";
      player: GamePlayer;
      card: StartupCard;
      bailoutsLeft: number;
    };

type GameDialogProps = {
  dialog: PendingDialog | null;
  onSettle: (value?: boolean) => void;
};

const GameDialog = ({ dialog, onSettle }: GameDialogProps) => {
  if (!dialog) return null;

  if (dialog.kind === "alert") {
    return (
      <Dialog open onOpenChange={(open) => !open && onSettle()}>
        <DialogContent className="sm:max-w-md [&>button]:hidden">
          <DialogHeader>
            <DialogTitle>{dialog.title}</DialogTitle>
            {dialog.description && (
              <DialogDescription className="whitespace-pre-line">
                {dialog.description}
              </DialogDescription>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onSettle()}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // bailout
  const { player, card, bailoutsLeft } = dialog;

  return (
    <AlertDialog open onOpenChange={(open) => !open && onSettle(false)}>
      <AlertDialogContent className="sm:max-w-md [&>button]:hidden">
        <AlertDialogHeader>
          <AlertDialogTitle>Use a Bailout Card?</AlertDialogTitle>
          <AlertDialogDescription className="whitespace-pre-line">
            {player.name} has {formatCash(player.cash)} but needs{" "}
            {formatCash(card.investmentAmount)} to invest in {card.title}.
            {"\n\n"}A Bailout Card adds {formatCash(4000)} to your cash.{" "}
            {bailoutsLeft} will be left after use.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onSettle(false)}>
            Skip Investment
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => onSettle(true)}>
            Use Bailout Card
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GameDialog;
