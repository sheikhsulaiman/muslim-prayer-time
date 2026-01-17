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
              {prayerData &&
                mainPrayers.map((prayer) => (
                  <div
                    key={prayer}
                    className={`rounded-lg border p-4 text-center transition-all ${
                      prayer === currentPrayer
                        ? "border-primary bg-primary/10 shadow-md"
                        : prayer === nextPrayer
                          ? "border-accent bg-accent/10"
                          : "bg-card hover:bg-accent/5"
                    }`}
                  >
                    <p className="mb-2 text-sm font-medium text-muted-foreground">
                      {prayer}
                    </p>
                    <p className="text-2xl font-bold tabular-nums">
                      {prayerData[prayer]}
                    </p>
                  </div>
                ))}
            </div>

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
