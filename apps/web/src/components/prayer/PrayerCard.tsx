import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import { BsSun, BsSunset } from "react-icons/bs";

interface PrayerCardProps {
  name: string;
  time: string;
  isCurrent: boolean;
  isNext: boolean;
}

export default function PrayerCard({
  name,
  time,
  isCurrent,
  isNext,
}: PrayerCardProps) {
  const getIcon = () => {
    switch (name) {
      case "Fajr":
        return <IoMoonOutline className="h-5 w-5 text-primary" />;
      case "Dhuhr":
        return <BsSun className="h-5 w-5 text-amber-500" />;
      case "Asr":
        return <IoSunnyOutline className="h-5 w-5 text-orange-500" />;
      case "Maghrib":
        return <BsSunset className="h-5 w-5 text-rose-500" />;
      case "Isha":
        return <IoMoonOutline className="h-5 w-5 text-indigo-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`rounded-xl border-2 p-4 text-center transition-all duration-300 hover:shadow-lg ${
        isCurrent
          ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/30 ring-offset-2 ring-offset-background animate-in fade-in zoom-in"
          : isNext
            ? "border-accent bg-accent/10 hover:ring-2 hover:ring-accent/20 hover:ring-offset-2"
            : "bg-card hover:bg-accent/5 hover:border-accent/50 hover:-translate-y-0.5"
      }`}
    >
      <div className="mb-3 flex items-center justify-center gap-2">
        {getIcon()}
        <p className="text-sm font-semibold text-muted-foreground">{name}</p>
      </div>
      <p className="text-3xl font-bold tabular-nums">{time}</p>
      {isCurrent && (
        <div className="mt-2 flex items-center justify-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-75" />
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse delay-150" />
        </div>
      )}
    </div>
  );
}
