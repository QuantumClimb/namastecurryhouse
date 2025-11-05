import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SpiceLevelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (spiceLevel: number) => void;
  itemName: string;
}

const SPICE_LEVELS = [
  { value: 0, label: "No Spice", icon: "🔵" },
  { value: 25, label: "Mild", icon: "🌶️" },
  { value: 50, label: "Medium", icon: "🌶️🌶️" },
  { value: 75, label: "Hot", icon: "🌶️🌶️🌶️" },
  { value: 100, label: "Extra Hot", icon: "🌶️🌶️🌶️🌶️" },
];

export function SpiceLevelDialog({ open, onOpenChange, onConfirm, itemName }: SpiceLevelDialogProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedLevel !== null) {
      onConfirm(selectedLevel);
      setSelectedLevel(null);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSelectedLevel(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Spice Level</DialogTitle>
          <DialogDescription>
            Choose your preferred spice level for {itemName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid gap-3">
            {SPICE_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelectedLevel(level.value)}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  selectedLevel === level.value
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{level.icon}</span>
                  <div className="text-left">
                    <div className="font-semibold">{level.label}</div>
                    <div className="text-sm text-muted-foreground">{level.value}% Spicy</div>
                  </div>
                </div>
                {selectedLevel === level.value && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={selectedLevel === null}
            className="bg-primary hover:bg-primary/90"
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
