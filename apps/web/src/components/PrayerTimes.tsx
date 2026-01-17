import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AladhanResponse, PrayerTimings } from "@/types/prayer";
import DigitalClock from "./prayer/DigitalClock";
import CurrentPrayerCard from "./prayer/CurrentPrayerCard";
import NextPrayerCard from "./prayer/NextPrayerCard";
import AllPrayerTimesCard from "./prayer/AllPrayerTimesCard";

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

  const mainPrayers: Array<keyof PrayerTimings> = [
    "Fajr",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha",
  ];

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

  const convertToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const addMinutesToTime = (time: string, minutes: number): string => {
    const timeMinutes = convertToMinutes(time);
    const newMinutes = timeMinutes + minutes;
    const hours = Math.floor(newMinutes / 60) % 24;
    const mins = newMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
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
  }, [prayerData, currentTime, mainPrayers]);

  // Check if current time is in a restricted period
  useEffect(() => {
    if (!prayerData) return;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const sunriseMinutes = convertToMinutes(prayerData.Sunrise);
    const dhuhrMinutes = convertToMinutes(prayerData.Dhuhr);
    const asrMinutes = convertToMinutes(prayerData.Asr);
    const maghribMinutes = convertToMinutes(prayerData.Maghrib);

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
    } else if (currentMinutes >= dhuhrStart && currentMinutes < dhuhrMinutes) {
      setIsRestrictedTime(true);
      setIsPrayerWindowEnded(false);
      setRestrictedTimeReason(
        "Sun at zenith - voluntary prayers not recommended (~10 min before Dhuhr)",
      );
    } else if (
      currentMinutes >= asrMinutes &&
      currentMinutes < maghribMinutes
    ) {
      setIsRestrictedTime(true);
      setIsPrayerWindowEnded(false);
      setRestrictedTimeReason(
        "Afternoon period - voluntary prayers not recommended (after Asr until Maghrib)",
      );
    } else {
      setIsRestrictedTime(false);
      setRestrictedTimeReason("");
    }
  }, [prayerData, currentTime]);

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
        <DigitalClock
          currentTime={currentTime}
          date={date}
          hijriDate={hijriDate}
          location={location}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <CurrentPrayerCard
            isRestrictedTime={isRestrictedTime}
            isPrayerWindowEnded={isPrayerWindowEnded}
            currentPrayer={currentPrayer}
            restrictedTimeReason={restrictedTimeReason}
            prayerData={prayerData}
          />

          <NextPrayerCard
            nextPrayer={nextPrayer}
            timeUntilNext={timeUntilNext}
            progress={progress}
            prayerData={prayerData}
          />
        </div>

        <AllPrayerTimesCard
          prayerData={prayerData}
          currentPrayer={currentPrayer}
          nextPrayer={nextPrayer}
          isRestrictedTime={isRestrictedTime}
          restrictedTimeReason={restrictedTimeReason}
          onRefresh={getUserLocation}
          addMinutesToTime={addMinutesToTime}
        />
      </div>
    </div>
  );
}
