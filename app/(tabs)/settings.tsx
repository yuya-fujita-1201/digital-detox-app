import { ScrollView, Text, View, Pressable, Switch } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { useThemeContext } from "@/lib/theme-provider";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useThemeContext();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleThemeToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  const handleNotificationToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationsEnabled(!notificationsEnabled);
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 20 }}>
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-sm text-muted">設定</Text>
            <Text className="text-3xl font-bold text-foreground">アプリ設定</Text>
          </View>

          {/* Appearance Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">表示</Text>

            <View
              className="rounded-2xl p-4 flex-row justify-between items-center"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <View className="gap-1">
                <Text className="text-base font-semibold text-foreground">ダークモード</Text>
                <Text className="text-xs text-muted">
                  {colorScheme === 'dark' ? "有効" : "無効"}
                </Text>
              </View>
              <Pressable
                onPress={handleThemeToggle}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Switch
                  value={colorScheme === 'dark'}
                  onValueChange={handleThemeToggle}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </Pressable>
            </View>
          </View>

          {/* Notifications Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">通知</Text>

            <View
              className="rounded-2xl p-4 flex-row justify-between items-center"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <View className="gap-1">
                <Text className="text-base font-semibold text-foreground">通知を有効にする</Text>
                <Text className="text-xs text-muted">
                  {notificationsEnabled ? "有効" : "無効"}
                </Text>
              </View>
              <Pressable
                onPress={handleNotificationToggle}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.background}
                />
              </Pressable>
            </View>

            <View
              className="rounded-2xl p-4 gap-2"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <Text className="text-sm font-semibold text-foreground">目標時間帯の通知</Text>
              <Text className="text-xs text-muted">
                設定した使用制限時間帯の開始・終了時に通知を受け取ります。
              </Text>
            </View>
          </View>

          {/* Data Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">データ</Text>

            <Pressable
              style={({ pressed }) => [
                {
                  borderRadius: 12,
                  padding: 16,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text className="text-base font-semibold text-foreground">データをエクスポート</Text>
              <Text className="text-xs text-muted mt-1">
                あなたのデータをJSONファイルとしてダウンロードします。
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                {
                  borderRadius: 12,
                  padding: 16,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text className="text-base font-semibold text-error">すべてのデータを削除</Text>
              <Text className="text-xs text-muted mt-1">
                すべての記録と設定を削除します。この操作は取り消せません。
              </Text>
            </Pressable>
          </View>

          {/* About Section */}
          <View className="gap-3">
            <Text className="text-sm font-semibold text-foreground">アプリについて</Text>

            <View
              className="rounded-2xl p-4 gap-3"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">アプリ名</Text>
                <Text className="text-sm font-semibold text-foreground">Digital Detox</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-sm text-muted">バージョン</Text>
                <Text className="text-sm font-semibold text-foreground">1.0.0</Text>
              </View>
            </View>
          </View>

          {/* Tips Section */}
          <View
            className="rounded-2xl p-4 gap-2"
            style={{ backgroundColor: colors.primary + "15" }}
          >
            <Text className="text-sm font-semibold text-foreground">💡 デジタルデトックスのコツ</Text>
            <Text className="text-xs text-muted leading-relaxed">
              毎日少しずつ放置時間を増やしていくことで、スマホ依存症の改善につながります。目標を設定して、習慣化を目指しましょう。
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
