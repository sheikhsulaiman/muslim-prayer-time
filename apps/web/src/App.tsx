import PrayerTimes from "@/components/PrayerTimes";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <PrayerTimes />
    </ThemeProvider>
  );
}

export default App;
