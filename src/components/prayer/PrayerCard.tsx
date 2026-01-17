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
      className={`rounded-xl border-2 p-4 text-center transition-all hover:shadow-md ${
        isCurrent
          ? "border-primary bg-primary/10 shadow-md scale-105"
          : isNext
            ? "border-accent bg-accent/10"
            : "bg-card hover:bg-accent/5"
      }`}
    >
      <div className="mb-3 flex items-center justify-center gap-2">
        {getIcon()}
        <p className="text-sm font-semibold text-muted-foreground">{name}</p>
      </div>
      <p className="text-3xl font-bold tabular-nums">{time}</p>
    </div>
  );
}
