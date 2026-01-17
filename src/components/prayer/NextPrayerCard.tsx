import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IoArrowForwardOutline, IoTimeOutline } from "react-icons/io5";
import type { PrayerTimings } from "@/types/prayer";

interface NextPrayerCardProps {
  nextPrayer: string;
  timeUntilNext: string;
  progress: number;
  prayerData: PrayerTimings | null;
}

export default function NextPrayerCard({
  nextPrayer,
  timeUntilNext,
  progress,
  prayerData,
}: NextPrayerCardProps) {
  return (
    <Card className="border-2 border-accent/30 shadow-lg transition-all duration-300 hover:shadow-xl hover:ring-2 hover:ring-accent/20 hover:ring-offset-2 hover:ring-offset-background hover:-translate-y-0.5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <IoArrowForwardOutline className="h-5 w-5 text-accent-foreground" />
          Next Prayer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-4">
              <p
                className="text-5xl font-bold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {nextPrayer}
              </p>
              {prayerData && (
                <div className="flex items-center gap-2 text-xl font-semibold tabular-nums text-muted-foreground">
                  <IoTimeOutline className="h-5 w-5" />
                  {prayerData[nextPrayer as keyof PrayerTimings]}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-lg font-medium text-muted-foreground">
              <IoTimeOutline className="h-5 w-5" />
              <span>in {timeUntilNext}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-4" />
            <p className="text-xs text-muted-foreground text-right">
              {progress.toFixed(0)}% elapsed
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
