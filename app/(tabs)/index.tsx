import { ScrollView, Text, View, Pressable, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useDetox } from "@/lib/detox-context";
import { useColors } from "@/hooks/use-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";

function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${seconds}s`;
}

function formatTimeHM(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { todayStats, isDetoxing, currentDetoxTime, startDetox, endDetox } = useDetox();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartDetox = async () => {
    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await startDetox();
    setIsLoading(false);
  };

  const handleEndDetox = async () => {
    setIsLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await endDetox();
    setIsLoading(false);
  };

  const getTodayDate = () => {
    const now = new Date();
    return now.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' });
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 20 }}>
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-sm text-muted">
              {getTodayDate()}
            </Text>
            <Text className="text-3xl font-bold text-foreground">
              今日のデジタルデトックス
            </Text>
          </View>

          {/* Status Card */}
          <View
            className="rounded-2xl p-6 gap-4"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            <View className="gap-1">
              <Text className="text-sm text-muted">現在のステータス</Text>
              <Text className="text-2xl font-bold text-foreground">
                {isDetoxing ? "📱 スマホ放置中" : "✅ 使用可能"}
              </Text>
            </View>

            {isDetoxing && (
              <View className="bg-primary/10 rounded-lg p-3 gap-1">
                <Text className="text-xs text-muted">連続放置時間</Text>
                <Text className="text-xl font-semibold text-primary">
                  {formatTime(currentDetoxTime)}
                </Text>
              </View>
            )}
          </View>

          {/* Statistics Cards */}
          <View className="gap-3">
            <View className="flex-row gap-3">
              {/* Detox Time Card */}
              <View
                className="flex-1 rounded-2xl p-4 gap-2"
                style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
              >
                <Text className="text-xs text-muted">放置時間</Text>
                <Text className="text-2xl font-bold text-success">
                  {formatTimeHM(todayStats?.detoxTime || 0)}
                </Text>
              </View>

              {/* Screen Time Card */}
              <View
                className="flex-1 rounded-2xl p-4 gap-2"
                style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
              >
                <Text className="text-xs text-muted">使用時間</Text>
                <Text className="text-2xl font-bold text-warning">
                  {formatTimeHM(todayStats?.screenTime || 0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3 pt-4">
            {!isDetoxing ? (
              <Pressable
                onPress={handleStartDetox}
                disabled={isLoading}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    borderRadius: 12,
                    padding: 16,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-center text-base font-semibold text-background">
                    放置を開始する
                  </Text>
                )}
              </Pressable>
            ) : (
              <Pressable
                onPress={handleEndDetox}
                disabled={isLoading}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.warning,
                    borderRadius: 12,
                    padding: 16,
                    opacity: pressed ? 0.9 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-center text-base font-semibold text-background">
                    放置を終了する
                  </Text>
                )}
              </Pressable>
            )}
          </View>

          {/* Tips Section */}
          <View
            className="rounded-2xl p-4 gap-2"
            style={{ backgroundColor: colors.primary + '15' }}
          >
            <Text className="text-sm font-semibold text-foreground">💡 ヒント</Text>
            <Text className="text-xs text-muted leading-relaxed">
              毎日少しずつ放置時間を増やしていくことで、スマホ依存症の改善につながります。
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
