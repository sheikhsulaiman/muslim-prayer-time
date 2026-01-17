import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AladhanResponse, PrayerTimings } from "@/types/prayer";

export default function PrayerTimes() {
  const [prayerData, setPrayerData] = useState<PrayerTimings | null>(null);
  const [location, setLocation] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [hijriDate, setHijriDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex min-h-svh items-center justify-center bg-linear-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Prayer Times</CardTitle>
          <CardDescription className="space-y-1">
            <div>{date}</div>
            <div className="text-sm">{hijriDate} AH</div>
            <div className="text-xs">{location}</div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {prayerData &&
            mainPrayers.map((prayer) => (
              <div
                key={prayer}
                className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent"
              >
                <span className="font-medium">{prayer}</span>
                <span className="text-lg font-semibold tabular-nums">
                  {prayerData[prayer]}
                </span>
              </div>
            ))}

          <div className="pt-4">
            <Button
              onClick={getUserLocation}
              className="w-full"
              variant="outline"
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
