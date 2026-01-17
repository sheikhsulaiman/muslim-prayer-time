import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IoTimeOutline, IoWarningOutline } from "react-icons/io5";
import { BsSun } from "react-icons/bs";
import type { PrayerTimings } from "@/types/prayer";

interface CurrentPrayerCardProps {
  isRestrictedTime: boolean;
  isPrayerWindowEnded: boolean;
  currentPrayer: string;
  restrictedTimeReason: string;
  prayerData: PrayerTimings | null;
}

export default function CurrentPrayerCard({
  isRestrictedTime,
  isPrayerWindowEnded,
  currentPrayer,
  restrictedTimeReason,
  prayerData,
}: CurrentPrayerCardProps) {
  return (
    <Card
      className={`border-2 shadow-lg transition-all duration-300 hover:shadow-xl ${
        isRestrictedTime
          ? "border-destructive/30 bg-destructive/5 ring-2 ring-destructive/20 ring-offset-2 ring-offset-background"
          : isPrayerWindowEnded
            ? "border-warning/30 bg-warning/10 ring-2 ring-warning/20 ring-offset-2 ring-offset-background"
            : "border-primary/30 bg-primary/5 ring-2 ring-primary/20 ring-offset-2 ring-offset-background backdrop-blur-sm"
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          {isRestrictedTime ? (
            <>
              <IoWarningOutline className="h-5 w-5 text-destructive" />
              Restricted Time
            </>
          ) : isPrayerWindowEnded ? (
            <>
              <IoTimeOutline className="h-5 w-5 text-warning-foreground" />
              Prayer Window Ended
            </>
          ) : (
            <>
              <BsSun className="h-5 w-5 text-primary" />
              Current Prayer
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isRestrictedTime ? (
            <>
              <p
                className="text-4xl font-bold text-destructive"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Restricted Time
              </p>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <IoWarningOutline className="h-5 w-5 mt-0.5 shrink-0" />
                <p>{restrictedTimeReason}</p>
              </div>
              <div className="mt-4 rounded-lg bg-background/50 p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Last prayer was:
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{currentPrayer}</p>
                  {prayerData && (
                    <p className="text-sm text-muted-foreground tabular-nums">
                      at {prayerData[currentPrayer as keyof PrayerTimings]}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : isPrayerWindowEnded ? (
            <>
              <p
                className="text-4xl font-bold text-warning"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Prayer Window Ended
              </p>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <p>
                  The window for {currentPrayer} prayer has passed. You can
                  still pray, but the preferred time has ended.
                </p>
              </div>
              <div className="mt-4 rounded-lg bg-background/50 p-3 border-2 border-warning">
                <p className="text-xs text-muted-foreground mb-1">
                  Last prayer was:
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{currentPrayer}</p>
                  {prayerData && (
                    <p className="text-sm text-muted-foreground tabular-nums">
                      at {prayerData[currentPrayer as keyof PrayerTimings]}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <p
                className="text-5xl font-bold text-primary"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {currentPrayer}
              </p>
              {prayerData && (
                <div className="flex items-center gap-2 text-2xl font-semibold tabular-nums text-muted-foreground">
                  <IoTimeOutline className="h-6 w-6" />
                  {prayerData[currentPrayer as keyof PrayerTimings]}
                </div>
              )}
              <div className="mt-3 rounded-lg bg-primary/10 p-3">
                <p className="text-xs text-muted-foreground">
                  Current prayer window is active
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
