import { IoArrowForwardOutline, IoWarningOutline } from "react-icons/io5";

interface RestrictedTimeCardProps {
  startTime: string;
  endTime: string;
  startIcon: React.ReactNode;
  endIcon: React.ReactNode;
  description: string;
}

export default function RestrictedTimeCard({
  startTime,
  endTime,
  startIcon,
  endIcon,
  description,
}: RestrictedTimeCardProps) {
  return (
    <div className="rounded-xl border-2 border-destructive/50 bg-destructive/10 p-4 text-center transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-destructive/30 hover:ring-offset-2 hover:ring-offset-background hover:-translate-y-0.5 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-center gap-2">
        <IoWarningOutline className="h-5 w-5 text-destructive animate-pulse" />
        <p className="text-xs font-bold text-destructive uppercase tracking-wider">
          Restricted
        </p>
      </div>
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-destructive">
        {startIcon}
        <span>{startTime}</span>
      </div>
      <div className="my-2 flex items-center justify-center">
        <IoArrowForwardOutline className="h-4 w-4 text-muted-foreground" />
      </div>
      {endTime ? (
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-destructive">
          {endIcon}
          <span>{endTime}</span>
        </div>
      ) : (
        <p className="text-sm font-semibold text-destructive">{endTime}</p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
