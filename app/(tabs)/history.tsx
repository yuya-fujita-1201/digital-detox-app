import { ScrollView, Text, View, Pressable } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useDetox } from "@/lib/detox-context";
import { useColors } from "@/hooks/use-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";

function formatTimeHM(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function getAchievementStatus(stats: any): "achieved" | "partial" | "none" {
  if (!stats) return "none";
  if (stats.detoxTime > 3600000) return "achieved"; // 1時間以上
  if (stats.detoxTime > 0) return "partial";
  return "none";
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { allStats } = useDetox();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Get current month
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Get calendar days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getDateString = (day: number) => {
    const date = new Date(year, month, day);
    return date.toISOString().split("T")[0];
  };

  const selectedStats = selectedDate ? allStats[selectedDate] : null;
  const monthStats = Object.entries(allStats).reduce(
    (acc, [dateStr, stats]) => {
      const date = new Date(dateStr);
      if (date.getFullYear() === year && date.getMonth() === month) {
        acc.totalDetoxTime += stats.detoxTime;
        acc.totalScreenTime += stats.screenTime;
        acc.daysWithData++;
      }
      return acc;
    },
    { totalDetoxTime: 0, totalScreenTime: 0, daysWithData: 0 }
  );

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 20 }}>
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-sm text-muted">履歴</Text>
            <Text className="text-3xl font-bold text-foreground">
              {now.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}
            </Text>
          </View>

          {/* Month Stats */}
          <View
            className="rounded-2xl p-4 gap-2"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            <View className="flex-row justify-between">
              <View className="gap-1">
                <Text className="text-xs text-muted">放置時間</Text>
                <Text className="text-lg font-bold text-success">
                  {formatTimeHM(monthStats.totalDetoxTime)}
                </Text>
              </View>
              <View className="gap-1">
                <Text className="text-xs text-muted">トラッキング日数</Text>
                <Text className="text-lg font-bold text-primary">
                  {monthStats.daysWithData}日
                </Text>
              </View>
            </View>
          </View>

          {/* Calendar */}
          <View className="gap-3">
            {/* Day Headers */}
            <View className="flex-row gap-1">
              {["日", "月", "火", "水", "木", "金", "土"].map((day) => (
                <View key={day} className="flex-1 items-center">
                  <Text className="text-xs font-semibold text-muted">{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View className="gap-1">
              {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIndex) => (
                <View key={weekIndex} className="flex-row gap-1">
                  {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                    if (day === null) {
                      return <View key={dayIndex} className="flex-1" />;
                    }

                    const dateStr = getDateString(day);
                    const dayStats = allStats[dateStr];
                    const status = getAchievementStatus(dayStats);

                    let bgColor = colors.surface;
                    if (status === "achieved") bgColor = colors.success;
                    else if (status === "partial") bgColor = colors.warning;

                    return (
                      <Pressable
                        key={dayIndex}
                        onPress={() => setSelectedDate(dateStr)}
                        style={({ pressed }) => [
                          {
                            flex: 1,
                            aspectRatio: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: 8,
                            backgroundColor: bgColor,
                            borderWidth: selectedDate === dateStr ? 2 : 1,
                            borderColor:
                              selectedDate === dateStr ? colors.primary : colors.border,
                            opacity: pressed ? 0.8 : 1,
                          },
                        ]}
                      >
                        <Text
                          className={`font-semibold ${
                            status === "achieved" || status === "partial"
                              ? "text-background"
                              : "text-foreground"
                          }`}
                        >
                          {day}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          {/* Selected Day Details */}
          {selectedStats && (
            <View
              className="rounded-2xl p-4 gap-3"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <Text className="text-sm font-semibold text-foreground">
                {new Date(selectedDate!).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                の詳細
              </Text>

              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">放置時間</Text>
                  <Text className="text-sm font-semibold text-success">
                    {formatTimeHM(selectedStats.detoxTime)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">スマホ使用時間</Text>
                  <Text className="text-sm font-semibold text-warning">
                    {formatTimeHM(selectedStats.screenTime)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted">セッション数</Text>
                  <Text className="text-sm font-semibold text-primary">
                    {selectedStats.sessions.length}回
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Empty State */}
          {monthStats.daysWithData === 0 && (
            <View
              className="rounded-2xl p-6 gap-2"
              style={{ backgroundColor: colors.primary + "15" }}
            >
              <Text className="text-sm font-semibold text-foreground">📅 データなし</Text>
              <Text className="text-xs text-muted">
                このカレンダーにはまだデータがありません。放置を開始してデータを記録しましょう。
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
