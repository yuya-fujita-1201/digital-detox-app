import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useDetox } from "@/lib/detox-context";
import { useColors } from "@/hooks/use-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";

type Period = "today" | "week" | "month";

function formatTimeHM(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function getDateLabel(period: Period): string {
  const now = new Date();
  switch (period) {
    case "today":
      return now.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
    case "week":
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${weekStart.toLocaleDateString("ja-JP", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("ja-JP", { month: "short", day: "numeric" })}`;
    case "month":
      return now.toLocaleDateString("ja-JP", { year: "numeric", month: "long" });
  }
}

export default function StatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { todayStats, allStats } = useDetox();
  const [period, setPeriod] = useState<Period>("today");

  const calculateStats = (p: Period) => {
    const now = new Date();
    let totalDetoxTime = 0;
    let totalScreenTime = 0;
    let daysTracked = 0;

    if (p === "today") {
      const today = now.toISOString().split("T")[0];
      const stats = allStats[today];
      if (stats) {
        totalDetoxTime = stats.detoxTime;
        totalScreenTime = stats.screenTime;
        daysTracked = 1;
      }
    } else if (p === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        const stats = allStats[dateStr];
        if (stats) {
          totalDetoxTime += stats.detoxTime;
          totalScreenTime += stats.screenTime;
          daysTracked++;
        }
      }
    } else if (p === "month") {
      const year = now.getFullYear();
      const month = now.getMonth();
      for (const dateStr in allStats) {
        const date = new Date(dateStr);
        if (date.getFullYear() === year && date.getMonth() === month) {
          totalDetoxTime += allStats[dateStr].detoxTime;
          totalScreenTime += allStats[dateStr].screenTime;
          daysTracked++;
        }
      }
    }

    return { totalDetoxTime, totalScreenTime, daysTracked };
  };

  const stats = calculateStats(period);
  const avgDetoxTime = stats.daysTracked > 0 ? stats.totalDetoxTime / stats.daysTracked : 0;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 20 }}>
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-sm text-muted">統計データ</Text>
            <Text className="text-3xl font-bold text-foreground">あなたのデータ</Text>
          </View>

          {/* Period Selector */}
          <View className="flex-row gap-2">
            {(["today", "week", "month"] as const).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    backgroundColor:
                      period === p ? colors.primary : colors.surface,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  className={`text-center text-sm font-semibold ${
                    period === p ? "text-background" : "text-foreground"
                  }`}
                >
                  {p === "today" ? "今日" : p === "week" ? "今週" : "今月"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Date Range */}
          <Text className="text-xs text-muted text-center">
            {getDateLabel(period)}
          </Text>

          {/* Stats Cards */}
          <View className="gap-3">
            {/* Detox Time */}
            <View
              className="rounded-2xl p-6 gap-2"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <Text className="text-sm text-muted">放置時間</Text>
              <Text className="text-3xl font-bold text-success">
                {formatTimeHM(stats.totalDetoxTime)}
              </Text>
              {stats.daysTracked > 1 && (
                <Text className="text-xs text-muted">
                  平均: {formatTimeHM(avgDetoxTime)} / 日
                </Text>
              )}
            </View>

            {/* Screen Time */}
            <View
              className="rounded-2xl p-6 gap-2"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <Text className="text-sm text-muted">スマホ使用時間</Text>
              <Text className="text-3xl font-bold text-warning">
                {formatTimeHM(stats.totalScreenTime)}
              </Text>
            </View>

            {/* Days Tracked */}
            <View
              className="rounded-2xl p-6 gap-2"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <Text className="text-sm text-muted">トラッキング日数</Text>
              <Text className="text-3xl font-bold text-primary">
                {stats.daysTracked}日
              </Text>
            </View>
          </View>

          {/* Info */}
          {stats.daysTracked === 0 && (
            <View
              className="rounded-2xl p-4 gap-2"
              style={{ backgroundColor: colors.primary + "15" }}
            >
              <Text className="text-sm font-semibold text-foreground">📊 データなし</Text>
              <Text className="text-xs text-muted">
                放置を開始して、データを記録しましょう。
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
