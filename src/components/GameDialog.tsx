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
import { Badge } from "@/components/ui/badge";
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
  | { kind: "invest"; player: GamePlayer; card: StartupCard }
  | {
      kind: "bailout";
      player: GamePlayer;
      card: StartupCard;
      bailoutsLeft: number;
    };

type GameDialogProps = {
  dialog: PendingDialog | null;
  /** Clears the dialog and releases the awaiting game logic. */
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

  if (dialog.kind === "invest") {
    const { player, card } = dialog;
    const affordable = player.cash >= card.investmentAmount;

    return (
      <AlertDialog open onOpenChange={(open) => !open && onSettle(false)}>
        <AlertDialogContent className="sm:max-w-md [&>button]:hidden">
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Startup Card</Badge>
              <Badge
                variant={
                  card.risk === "High"
                    ? "destructive"
                    : card.risk === "Medium"
                      ? "secondary"
                      : "outline"
                }
              >
                {card.risk} Risk
              </Badge>
            </div>
            <AlertDialogTitle>{card.title}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {card.description}
              {"\n\n"}
              <span className="font-semibold text-foreground">
                Investment: {formatCash(card.investmentAmount)}
              </span>
              {" • "}
              Your cash: {formatCash(player.cash)}
              {!affordable && (
                <>
                  {"\n"}
                  You cannot afford this — a Bailout Card (+₹4,000) can cover it.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onSettle(false)}>
              No
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => onSettle(true)}>
              Invest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
