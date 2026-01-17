import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AladhanResponse, PrayerTimings } from "@/types/prayer";

export default function PrayerTimes() {
  const [prayerData, setPrayerData] = useState<PrayerTimings | null>(null);
  const [location, setLocation] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [hijriDate, setHijriDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPrayer, setCurrentPrayer] = useState<string>("");
  const [nextPrayer, setNextPrayer] = useState<string>("");
  const [timeUntilNext, setTimeUntilNext] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [isRestrictedTime, setIsRestrictedTime] = useState<boolean>(false);
  const [restrictedTimeReason, setRestrictedTimeReason] = useState<string>("");

  const fetchPrayerTimes = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch prayer times");
      }

      const data: AladhanResponse = await response.json();

      setPrayerData(data.data.timings);
      setDate(data.data.date.gregorian.date);
      setHijriDate(
        `${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`,
      );
      setLocation(
        `${data.data.meta.latitude.toFixed(2)}°, ${data.data.meta.longitude.toFixed(2)}°`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError(
            "Unable to get your location. Please enable location services.",
          );
          setLoading(false);
          console.error(err);
        },
      );
    } else {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate current prayer, next prayer, and progress
  useEffect(() => {
    if (!prayerData) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const prayers = mainPrayers.map((name) => ({
      name,
      time: prayerData[name],
      minutes: convertToMinutes(prayerData[name]),
    }));

    // Find current and next prayer
    let current = "Isha";
    let next = "Fajr";
    let nextTime = prayers[0].minutes;
    let currentTime = prayers[prayers.length - 1].minutes;

    for (let i = 0; i < prayers.length; i++) {
      if (currentMinutes >= prayers[i].minutes) {
        current = prayers[i].name;
        currentTime = prayers[i].minutes;
        next = prayers[(i + 1) % prayers.length].name;
        nextTime = prayers[(i + 1) % prayers.length].minutes;
      } else {
        break;
      }
    }

    setCurrentPrayer(current);
    setNextPrayer(next);

    // Calculate time until next prayer
    let minutesUntilNext = nextTime - currentMinutes;
    if (minutesUntilNext < 0) {
      minutesUntilNext += 24 * 60; // Add 24 hours if next prayer is tomorrow
    }

    const hours = Math.floor(minutesUntilNext / 60);
    const minutes = minutesUntilNext % 60;
    setTimeUntilNext(`${hours}h ${minutes.toString().padStart(2, "0")}m`);

    // Calculate progress
    let totalDuration = nextTime - currentTime;
    if (totalDuration < 0) {
      totalDuration += 24 * 60;
    }
    const elapsed = totalDuration - minutesUntilNext;
    const progressPercent = (elapsed / totalDuration) * 100;
    setProgress(Math.min(Math.max(progressPercent, 0), 100));
  }, [prayerData, currentTime]);

  const convertToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const addMinutesToTime = (time: string, minutes: number): string => {
    const timeMinutes = convertToMinutes(time);
    const newMinutes = timeMinutes + minutes;
    const hours = Math.floor(newMinutes / 60) % 24;
    const mins = newMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // Check if current time is in a restricted period
  useEffect(() => {
    if (!prayerData) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const sunriseMinutes = convertToMinutes(prayerData.Sunrise);
    const dhuhrMinutes = convertToMinutes(prayerData.Dhuhr);
    const asrMinutes = convertToMinutes(prayerData.Asr);
    const maghribMinutes = convertToMinutes(prayerData.Maghrib);

    console.log("Current time (minutes):", currentMinutes);
    console.log(
      "Sunrise:",
      prayerData.Sunrise,
      "->",
      sunriseMinutes,
      "End:",
      sunriseMinutes + 20,
    );
    console.log(
      "Dhuhr:",
      prayerData.Dhuhr,
      "->",
      dhuhrMinutes,
      "Start:",
      dhuhrMinutes - 10,
    );
    console.log("Asr:", prayerData.Asr, "->", asrMinutes);
    console.log("Maghrib:", prayerData.Maghrib, "->", maghribMinutes);

    // Restricted times:
    // 1. From sunrise until ~20 minutes after
    // 2. Few minutes before Dhuhr (when sun is at zenith)
    // 3. From Asr until Maghrib

    const sunriseEnd = sunriseMinutes + 20;
    const dhuhrStart = dhuhrMinutes - 10;

    if (currentMinutes >= sunriseMinutes && currentMinutes <= sunriseEnd) {
      setIsRestrictedTime(true);
      setRestrictedTimeReason(
        "Sunrise period - voluntary prayers not recommended (~20 min after sunrise)",
      );
      console.log("RESTRICTED: Sunrise period");
    } else if (currentMinutes >= dhuhrStart && currentMinutes < dhuhrMinutes) {
      setIsRestrictedTime(true);
      setRestrictedTimeReason(
        "Sun at zenith - voluntary prayers not recommended (~10 min before Dhuhr)",
      );
      console.log("RESTRICTED: Dhuhr period");
    } else if (
      currentMinutes >= asrMinutes &&
      currentMinutes < maghribMinutes
    ) {
      setIsRestrictedTime(true);
      setRestrictedTimeReason(
        "Afternoon period - voluntary prayers not recommended (after Asr until Maghrib)",
      );
      console.log("RESTRICTED: Asr period");
    } else {
      setIsRestrictedTime(false);
      setRestrictedTimeReason("");
      console.log("NOT RESTRICTED");
    }
  }, [prayerData, currentTime]);

  const mainPrayers: Array<keyof PrayerTimings> = [
    "Fajr",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha",
  ];

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Loading prayer times...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="mb-4 text-destructive">{error}</p>
            <Button onClick={getUserLocation}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-linear-to-br from-background to-muted/20 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header with Clock */}
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-4 text-center">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{date}</p>
                <p className="text-xs text-muted-foreground">{hijriDate} AH</p>
                <p className="text-xs text-muted-foreground">{location}</p>
              </div>

              {/* Big Digital Clock */}
              <div className="font-mono text-5xl font-bold tracking-wider md:text-7xl">
                {formatTime(currentTime)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Prayer & Next Prayer Info */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Prayer Card */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Current Prayer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-4xl font-bold text-primary">
                  {currentPrayer}
                </p>
                {prayerData && (
                  <p className="text-2xl font-semibold tabular-nums text-muted-foreground">
                    {prayerData[currentPrayer as keyof PrayerTimings]}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Next Prayer Countdown */}
          <Card className="border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="text-lg">Next Prayer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <p className="text-4xl font-bold">{nextPrayer}</p>
                    {prayerData && (
                      <p className="text-xl font-semibold tabular-nums text-muted-foreground">
                        {prayerData[nextPrayer as keyof PrayerTimings]}
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-medium text-muted-foreground">
                    in {timeUntilNext}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <Progress value={progress} className="h-3" />
                  <p className="text-xs text-muted-foreground text-right">
                    {progress.toFixed(0)}% elapsed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Prayer Times */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Prayer Times</CardTitle>
            <CardDescription>All five daily prayers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {prayerData && (
                <>
                  {/* Fajr */}
                  <div
                    className={`rounded-lg border p-4 text-center transition-all ${
                      "Fajr" === currentPrayer
                        ? "border-primary bg-primary/10 shadow-md"
                        : "Fajr" === nextPrayer
                          ? "border-accent bg-accent/10"
                          : "bg-card hover:bg-accent/5"
                    }`}
                  >
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Fajr
                    </p>
                    <p className="text-2xl font-bold tabular-nums">
                      {prayerData.Fajr}
                    </p>
                  </div>

                  {/* Restricted Time 1: After Sunrise */}
                  <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4 text-center">
                    <p className="mb-2 text-xs font-semibold text-destructive uppercase">
                      ⛔ Restricted
                    </p>
                    <p className="text-sm font-medium text-destructive">
                      {prayerData.Sunrise}
                    </p>
                    <p className="text-xs text-muted-foreground my-1">to</p>
                    <p className="text-sm font-medium text-destructive">
                      {addMinutesToTime(prayerData.Sunrise, 20)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      After sunrise
                    </p>
                  </div>

                  {/* Dhuhr */}
                  <div
                    className={`rounded-lg border p-4 text-center transition-all ${
                      "Dhuhr" === currentPrayer
                        ? "border-primary bg-primary/10 shadow-md"
                        : "Dhuhr" === nextPrayer
                          ? "border-accent bg-accent/10"
                          : "bg-card hover:bg-accent/5"
                    }`}
                  >
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Dhuhr
                    </p>
                    <p className="text-2xl font-bold tabular-nums">
                      {prayerData.Dhuhr}
                    </p>
                  </div>

                  {/* Asr */}
                  <div
                    className={`rounded-lg border p-4 text-center transition-all ${
                      "Asr" === currentPrayer
                        ? "border-primary bg-primary/10 shadow-md"
                        : "Asr" === nextPrayer
                          ? "border-accent bg-accent/10"
                          : "bg-card hover:bg-accent/5"
                    }`}
                  >
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Asr
                    </p>
                    <p className="text-2xl font-bold tabular-nums">
                      {prayerData.Asr}
                    </p>
                  </div>

                  {/* Restricted Time 2: After Asr until Maghrib */}
                  <div className="rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4 text-center">
                    <p className="mb-2 text-xs font-semibold text-destructive uppercase">
                      ⛔ Restricted
                    </p>
                    <p className="text-sm font-medium text-destructive">
                      {prayerData.Asr}
                    </p>
                    <p className="text-xs text-muted-foreground my-1">to</p>
                    <p className="text-sm font-medium text-destructive">
                      {prayerData.Maghrib}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Until sunset
                    </p>
                  </div>

                  {/* Maghrib */}
                  <div
                    className={`rounded-lg border p-4 text-center transition-all ${
                      "Maghrib" === currentPrayer
                        ? "border-primary bg-primary/10 shadow-md"
                        : "Maghrib" === nextPrayer
                          ? "border-accent bg-accent/10"
                          : "bg-card hover:bg-accent/5"
                    }`}
                  >
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Maghrib
                    </p>
                    <p className="text-2xl font-bold tabular-nums">
                      {prayerData.Maghrib}
                    </p>
                  </div>

                  {/* Isha */}
                  <div
                    className={`rounded-lg border p-4 text-center transition-all ${
                      "Isha" === currentPrayer
                        ? "border-primary bg-primary/10 shadow-md"
                        : "Isha" === nextPrayer
                          ? "border-accent bg-accent/10"
                          : "bg-card hover:bg-accent/5"
                    }`}
                  >
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      Isha
                    </p>
                    <p className="text-2xl font-bold tabular-nums">
                      {prayerData.Isha}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Restricted Time Warning */}
            {isRestrictedTime && (
              <div className="mt-4 rounded-lg border-2 border-destructive/50 bg-destructive/10 p-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">⚠️</span>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-destructive">
                      Restricted Prayer Time
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {restrictedTimeReason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6">
              <Button
                onClick={getUserLocation}
                className="w-full"
                variant="outline"
              >
                Refresh Location
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
