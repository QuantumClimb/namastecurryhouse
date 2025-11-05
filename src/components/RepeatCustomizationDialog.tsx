import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RepeatCustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRepeat: () => void;
  onCustomize: () => void;
  itemName: string;
  previousSpiceLevel: number;
}

const getSpiceLevelLabel = (level: number): string => {
  if (level === 0) return "No Spice";
  if (level === 25) return "Mild";
  if (level === 50) return "Medium";
  if (level === 75) return "Hot";
  if (level === 100) return "Extra Hot";
  return `${level}% Spicy`;
};

const getSpiceIcon = (level: number): string => {
  if (level === 0) return "🔵";
  if (level === 25) return "🌶️";
  if (level === 50) return "🌶️🌶️";
  if (level === 75) return "🌶️🌶️🌶️";
  if (level === 100) return "🌶️🌶️🌶️🌶️";
  return "🌶️";
};

export function RepeatCustomizationDialog({
  open,
  onOpenChange,
  onRepeat,
  onCustomize,
  itemName,
  previousSpiceLevel,
}: RepeatCustomizationDialogProps) {
  
  const handleRepeat = () => {
    onRepeat();
    onOpenChange(false);
  };

  const handleCustomize = () => {
    onCustomize();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Repeat Customization?</DialogTitle>
          <DialogDescription>
            You've previously ordered {itemName} with custom spice level
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <span className="text-3xl">{getSpiceIcon(previousSpiceLevel)}</span>
            <div className="text-center">
              <div className="font-semibold text-lg">{getSpiceLevelLabel(previousSpiceLevel)}</div>
              <div className="text-sm text-muted-foreground">{previousSpiceLevel}% Spicy</div>
            </div>
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Would you like to use the same spice level or choose a different one?
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleRepeat}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Yes, Use Same Spice Level
          </Button>
          <Button 
            onClick={handleCustomize}
            variant="outline"
            className="w-full"
          >
            No, Choose Different Level
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
