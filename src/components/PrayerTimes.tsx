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
import {
  IoSunnyOutline,
  IoMoonOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoRefreshOutline,
  IoWarningOutline,
  IoArrowForwardOutline,
} from "react-icons/io5";
import { BsSunrise, BsSunset, BsSun } from "react-icons/bs";

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
  const [isPrayerWindowEnded, setIsPrayerWindowEnded] =
    useState<boolean>(false);

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

    // Check if we're past a prayer time (prayer window ended)
    // This happens when we're past the prayer time but before the next prayer
    const currentPrayerMinutes =
      prayers.find((p) => p.name === current)?.minutes || 0;
    const isPastPrayerTime =
      currentMinutes > currentPrayerMinutes && currentMinutes < nextTime;
    setIsPrayerWindowEnded(isPastPrayerTime);
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
      setIsPrayerWindowEnded(false);
      setRestrictedTimeReason(
        "Sunrise period - voluntary prayers not recommended (~20 min after sunrise)",
      );
      console.log("RESTRICTED: Sunrise period");
    } else if (currentMinutes >= dhuhrStart && currentMinutes < dhuhrMinutes) {
      setIsRestrictedTime(true);
      setIsPrayerWindowEnded(false);
      setRestrictedTimeReason(
        "Sun at zenith - voluntary prayers not recommended (~10 min before Dhuhr)",
      );
      console.log("RESTRICTED: Dhuhr period");
    } else if (
      currentMinutes >= asrMinutes &&
      currentMinutes < maghribMinutes
    ) {
      setIsRestrictedTime(true);
      setIsPrayerWindowEnded(false);
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
    <div className="min-h-svh bg-linear-to-br from-background via-background to-muted/30 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header with Clock */}
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
              <div className="text-xs text-muted-foreground">
                {hijriDate} AH
              </div>

              {/* Big Digital Clock */}
              <div className="flex items-center justify-center gap-3">
                <IoTimeOutline className="h-12 w-12 text-primary md:h-16 md:w-16" />
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

        {/* Current Prayer & Next Prayer Info */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Prayer Card */}
          <Card
            className={`border-2 shadow-lg ${
              isRestrictedTime
                ? "border-destructive/30 bg-destructive/5"
                : isPrayerWindowEnded
                  ? "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20"
                  : "border-primary/30 bg-primary/5"
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
                    <IoTimeOutline className="h-5 w-5 text-amber-600" />
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
                            at{" "}
                            {prayerData[currentPrayer as keyof PrayerTimings]}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                ) : isPrayerWindowEnded ? (
                  <>
                    <p
                      className="text-4xl font-bold text-amber-600"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      Prayer Window Ended
                    </p>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <IoTimeOutline className="h-5 w-5 mt-0.5 shrink-0 text-amber-600" />
                      <p>
                        The window for {currentPrayer} prayer has passed. You
                        can still pray, but the preferred time has ended.
                      </p>
                    </div>
                    <div className="mt-4 rounded-lg bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Last prayer was:
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-semibold">{currentPrayer}</p>
                        {prayerData && (
                          <p className="text-sm text-muted-foreground tabular-nums">
                            at{" "}
                            {prayerData[currentPrayer as keyof PrayerTimings]}
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

          {/* Next Prayer Countdown */}
          <Card className="border-2 border-accent/30 shadow-lg">
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
        </div>

        {/* All Prayer Times */}
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
                  <div
                    className={`rounded-xl border-2 p-4 text-center transition-all hover:shadow-md ${
                      "Fajr" === currentPrayer
                        ? "border-primary bg-primary/10 shadow-md scale-105"
                        : "Fajr" === nextPrayer
                          ? "border-accent bg-accent/10"
                          : "bg-card hover:bg-accent/5"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-center gap-2">
                      <IoMoonOutline className="h-5 w-5 text-primary" />
                      <p className="text-sm font-semibold text-muted-foreground">
                        Fajr
                      </p>
                    </div>
                    <p className="text-3xl font-bold tabular-nums">
                      {prayerData.Fajr}
                    </p>
                  </div>

                  {/* Restricted Time 1: After Sunrise */}
                  <div className="rounded-xl border-2 border-destructive/50 bg-destructive/10 p-4 text-center transition-all hover:shadow-md">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <IoWarningOutline className="h-5 w-5 text-destructive" />
                      <p className="text-xs font-bold text-destructive uppercase">
                        Restricted
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-destructive">
                      <BsSunrise className="h-4 w-4" />
                      <span>{prayerData.Sunrise}</span>
                    </div>
                    <div className="my-2 flex items-center justify-center">
                      <IoArrowForwardOutline className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-destructive">
                      {addMinutesToTime(prayerData.Sunrise, 20)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      After sunrise
                    </p>
                  </div>

                  {/* Dhuhr */}
                  <div
                    className={`rounded-xl border-2 p-4 text-center transition-all hover:shadow-md ${
                      "Dhuhr" === currentPrayer
                        ? "border-primary bg-primary/10 shadow-md scale-105"
                        : "Dhuhr" === nextPrayer
                          ? "border-accent bg-accent/10"
                          : "bg-card hover:bg-accent/5"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-center gap-2">
                      <BsSun className="h-5 w-5 text-amber-500" />
                      <p className="text-sm font-semibold text-muted-foreground">
                        Dhuhr
                      </p>
                    </div>
                    <p className="text-3xl font-bold tabular-nums">
                      {prayerData.Dhuhr}
                    </p>
                  </div>

                  {/* Asr */}
                  <div
                    className={`rounded-xl border-2 p-4 text-center transition-all hover:shadow-md ${
                      "Asr" === currentPrayer
                        ? "border-primary bg-primary/10 shadow-md scale-105"
                        : "Asr" === nextPrayer
                          ? "border-accent bg-accent/10"
                          : "bg-card hover:bg-accent/5"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-center gap-2">
                      <IoSunnyOutline className="h-5 w-5 text-orange-500" />
                      <p className="text-sm font-semibold text-muted-foreground">
                        Asr
                      </p>
                    </div>
                    <p className="text-3xl font-bold tabular-nums">
                      {prayerData.Asr}
                    </p>
                  </div>

                  {/* Restricted Time 2: After Asr until Maghrib */}
                  <div className="rounded-xl border-2 border-destructive/50 bg-destructive/10 p-4 text-center transition-all hover:shadow-md">
                    <div className="mb-2 flex items-center justify-center gap-2">
                      <IoWarningOutline className="h-5 w-5 text-destructive" />
                      <p className="text-xs font-bold text-destructive uppercase">
                        Restricted
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-destructive">
                      <IoSunnyOutline className="h-4 w-4" />
                      <span>{prayerData.Asr}</span>
                    </div>
                    <div className="my-2 flex items-center justify-center">
                      <IoArrowForwardOutline className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-destructive">
                      <BsSunset className="h-4 w-4" />
                      <span>{prayerData.Maghrib}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Until sunset
                    </p>
                  </div>

                  {/* Maghrib */}
                  <div
                    className={`rounded-xl border-2 p-4 text-center transition-all hover:shadow-md ${
                      "Maghrib" === currentPrayer
                        ? "border-primary bg-primary/10 shadow-md scale-105"
                        : "Maghrib" === nextPrayer
                          ? "border-accent bg-accent/10"
                          : "bg-card hover:bg-accent/5"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-center gap-2">
                      <BsSunset className="h-5 w-5 text-rose-500" />
                      <p className="text-sm font-semibold text-muted-foreground">
                        Maghrib
                      </p>
                    </div>
                    <p className="text-3xl font-bold tabular-nums">
                      {prayerData.Maghrib}
                    </p>
                  </div>

                  {/* Isha */}
                  <div
                    className={`rounded-xl border-2 p-4 text-center transition-all hover:shadow-md ${
                      "Isha" === currentPrayer
                        ? "border-primary bg-primary/10 shadow-md scale-105"
                        : "Isha" === nextPrayer
                          ? "border-accent bg-accent/10"
                          : "bg-card hover:bg-accent/5"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-center gap-2">
                      <IoMoonOutline className="h-5 w-5 text-indigo-500" />
                      <p className="text-sm font-semibold text-muted-foreground">
                        Isha
                      </p>
                    </div>
                    <p className="text-3xl font-bold tabular-nums">
                      {prayerData.Isha}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Restricted Time Warning */}
            {isRestrictedTime && (
              <div className="mt-4 rounded-xl border-2 border-destructive/50 bg-destructive/10 p-4 shadow-md">
                <div className="flex items-center justify-center gap-3">
                  <IoWarningOutline className="h-6 w-6 text-destructive" />
                  <div className="text-center">
                    <p className="text-sm font-bold text-destructive">
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
                className="w-full gap-2"
                variant="outline"
              >
                <IoRefreshOutline className="h-4 w-4" />
                Refresh Location
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
