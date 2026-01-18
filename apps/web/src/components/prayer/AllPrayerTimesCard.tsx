import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IoMoonOutline,
  IoRefreshOutline,
  IoSunnyOutline,
  IoWarningOutline,
} from "react-icons/io5";
import { BsSunrise, BsSunset } from "react-icons/bs";
import type { PrayerTimings } from "@/types/prayer";
import PrayerCard from "./PrayerCard";
import RestrictedTimeCard from "./RestrictedTimeCard";

interface AllPrayerTimesCardProps {
  prayerData: PrayerTimings | null;
  currentPrayer: string;
  nextPrayer: string;
  isRestrictedTime: boolean;
  restrictedTimeReason: string;
  onRefresh: () => void;
  addMinutesToTime: (time: string, minutes: number) => string;
}

export default function AllPrayerTimesCard({
  prayerData,
  currentPrayer,
  nextPrayer,
  isRestrictedTime,
  restrictedTimeReason,
  onRefresh,
  addMinutesToTime,
}: AllPrayerTimesCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IoMoonOutline className="h-6 w-6" />
          Today's Prayer Times
        </CardTitle>
        <CardDescription>
          All five daily prayers and restricted times
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {prayerData && (
            <>
              {/* Fajr */}
              <PrayerCard
                name="Fajr"
                time={prayerData.Fajr}
                isCurrent={currentPrayer === "Fajr"}
                isNext={nextPrayer === "Fajr"}
              />

              {/* Restricted Time 1: After Sunrise (~20 min) */}
              <RestrictedTimeCard
                startTime={prayerData.Sunrise}
                endTime={addMinutesToTime(prayerData.Sunrise, 20)}
                startIcon={<BsSunrise className="h-4 w-4" />}
                endIcon={null}
                description="After sunrise"
              />

              {/* Restricted Time 2: Before Dhuhr (~10 min) */}
              <RestrictedTimeCard
                startTime={addMinutesToTime(prayerData.Dhuhr, -10)}
                endTime={prayerData.Dhuhr}
                startIcon={<IoWarningOutline className="h-4 w-4" />}
                endIcon={null}
                description="Before Dhuhr"
              />

              {/* Dhuhr */}
              <PrayerCard
                name="Dhuhr"
                time={prayerData.Dhuhr}
                isCurrent={currentPrayer === "Dhuhr"}
                isNext={nextPrayer === "Dhuhr"}
              />

              {/* Asr */}
              <PrayerCard
                name="Asr"
                time={prayerData.Asr}
                isCurrent={currentPrayer === "Asr"}
                isNext={nextPrayer === "Asr"}
              />

              {/* Restricted Time 3: Before Maghrib (~20 min) */}
              <RestrictedTimeCard
                startTime={addMinutesToTime(prayerData.Maghrib, -20)}
                endTime={prayerData.Maghrib}
                startIcon={<IoSunnyOutline className="h-4 w-4" />}
                endIcon={<BsSunset className="h-4 w-4" />}
                description="Until sunset"
              />

              {/* Maghrib */}
              <PrayerCard
                name="Maghrib"
                time={prayerData.Maghrib}
                isCurrent={currentPrayer === "Maghrib"}
                isNext={nextPrayer === "Maghrib"}
              />

              {/* Isha */}
              <PrayerCard
                name="Isha"
                time={prayerData.Isha}
                isCurrent={currentPrayer === "Isha"}
                isNext={nextPrayer === "Isha"}
              />
            </>
          )}
        </div>

        {/* Restricted Time Warning */}
        {isRestrictedTime && (
          <div className="mt-4 rounded-xl border-2 border-destructive/50 bg-destructive/10 p-4 shadow-md">
            <div className="flex items-center justify-center gap-3">
              <div className="items-center">
                <div className="flex items-center justify-center gap-3">
                  <IoWarningOutline className="h-6 w-6 text-destructive" />
                  <p className="text-sm font-bold text-destructive">
                    Restricted Prayer Time
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {restrictedTimeReason}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={onRefresh}
            className="w-full gap-2"
            variant="outline"
          >
            <IoRefreshOutline className="h-4 w-4" />
            Refresh Location
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
