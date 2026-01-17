import { Card, CardContent } from "@/components/ui/card";
import { IoCalendarOutline, IoLocationOutline } from "react-icons/io5";

interface DigitalClockProps {
  currentTime: Date;
  date: string;
  hijriDate: string;
  location: string;
}

export default function DigitalClock({
  currentTime,
  date,
  hijriDate,
  location,
}: DigitalClockProps) {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <Card className="overflow-hidden border-2 shadow-xl">
      <CardContent className="p-6 md:p-10">
        <div className="space-y-6 text-center">
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <IoCalendarOutline className="h-4 w-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <IoLocationOutline className="h-4 w-4" />
              <span>{location}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{hijriDate} AH</div>

          {/* Big Digital Clock */}
          <div className="flex items-center justify-center gap-3">
            <div
              className="font-mono text-6xl font-bold tracking-tight md:text-8xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {formatTime(currentTime)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
