import { ScrollView, Text, View, Pressable, Modal, TextInput, Switch, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useDetox, TimeRestriction } from "@/lib/detox-context";
import { useColors } from "@/hooks/use-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import * as Haptics from "expo-haptics";

const DAYS_OF_WEEK = ["日", "月", "火", "水", "木", "金", "土"];

export default function GoalsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { timeRestrictions, addTimeRestriction, deleteTimeRestriction } = useDetox();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [startHour, setStartHour] = useState("09");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("12");
  const [endMinute, setEndMinute] = useState("00");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // 平日

  const handleAddGoal = async () => {
    if (!name.trim()) return;

    const newRestriction: TimeRestriction = {
      id: `restriction_${Date.now()}`,
      name,
      startHour: parseInt(startHour),
      startMinute: parseInt(startMinute),
      endHour: parseInt(endHour),
      endMinute: parseInt(endMinute),
      daysOfWeek: selectedDays,
      enabled: true,
    };

    await addTimeRestriction(newRestriction);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Reset form
    setName("");
    setStartHour("09");
    setStartMinute("00");
    setEndHour("12");
    setEndMinute("00");
    setSelectedDays([1, 2, 3, 4, 5]);
    setShowModal(false);
  };

  const handleDeleteGoal = async (id: string) => {
    await deleteTimeRestriction(id);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const getDayLabel = (days: number[]) => {
    if (days.length === 7) return "毎日";
    if (days.length === 5 && days.every((d) => d >= 1 && d <= 5)) return "平日";
    if (days.length === 2 && days.includes(0) && days.includes(6)) return "週末";
    return days.map((d) => DAYS_OF_WEEK[d]).join(", ");
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 20 }}>
        <View className="p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-sm text-muted">目標設定</Text>
            <Text className="text-3xl font-bold text-foreground">使用制限時間帯</Text>
          </View>

          {/* Add Goal Button */}
          <Pressable
            onPress={() => setShowModal(true)}
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
            <Text className="text-center text-base font-semibold text-background">
              + 新しい目標を追加
            </Text>
          </Pressable>

          {/* Goals List */}
          {timeRestrictions.length === 0 ? (
            <View
              className="rounded-2xl p-6 gap-2"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <Text className="text-sm text-muted text-center">目標がまだ設定されていません</Text>
              <Text className="text-xs text-muted text-center">
                スマホを使用しない時間帯を設定して、デジタルデトックスを始めましょう。
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {timeRestrictions.map((restriction) => (
                <View
                  key={restriction.id}
                  className="rounded-2xl p-4 gap-3"
                  style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1 gap-1">
                      <Text className="text-base font-semibold text-foreground">
                        {restriction.name}
                      </Text>
                      <Text className="text-sm text-muted">
                        {String(restriction.startHour).padStart(2, "0")}:
                        {String(restriction.startMinute).padStart(2, "0")} - {String(restriction.endHour).padStart(2, "0")}:
                        {String(restriction.endMinute).padStart(2, "0")}
                      </Text>
                      <Text className="text-xs text-muted">
                        {getDayLabel(restriction.daysOfWeek)}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => handleDeleteGoal(restriction.id)}
                      style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                    >
                      <Text className="text-lg text-error">✕</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50">
          <View
            className="flex-1 rounded-t-3xl p-6 gap-6"
            style={{ backgroundColor: colors.background, marginTop: "auto" }}
          >
            <View className="gap-2">
              <Text className="text-2xl font-bold text-foreground">新しい目標を追加</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Goal Name */}
              <View className="gap-2 mb-4">
                <Text className="text-sm font-semibold text-foreground">目標の名前</Text>
                <TextInput
                  placeholder="例: 午前中はスマホを使わない"
                  placeholderTextColor={colors.muted}
                  value={name}
                  onChangeText={setName}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.foreground,
                    backgroundColor: colors.surface,
                  }}
                />
              </View>

              {/* Start Time */}
              <View className="gap-2 mb-4">
                <Text className="text-sm font-semibold text-foreground">開始時刻</Text>
                <View className="flex-row gap-2">
                  <TextInput
                    placeholder="HH"
                    placeholderTextColor={colors.muted}
                    value={startHour}
                    onChangeText={setStartHour}
                    keyboardType="number-pad"
                    maxLength={2}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      padding: 12,
                      color: colors.foreground,
                      backgroundColor: colors.surface,
                      textAlign: "center",
                    }}
                  />
                  <Text className="text-2xl text-foreground">:</Text>
                  <TextInput
                    placeholder="MM"
                    placeholderTextColor={colors.muted}
                    value={startMinute}
                    onChangeText={setStartMinute}
                    keyboardType="number-pad"
                    maxLength={2}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      padding: 12,
                      color: colors.foreground,
                      backgroundColor: colors.surface,
                      textAlign: "center",
                    }}
                  />
                </View>
              </View>

              {/* End Time */}
              <View className="gap-2 mb-4">
                <Text className="text-sm font-semibold text-foreground">終了時刻</Text>
                <View className="flex-row gap-2">
                  <TextInput
                    placeholder="HH"
                    placeholderTextColor={colors.muted}
                    value={endHour}
                    onChangeText={setEndHour}
                    keyboardType="number-pad"
                    maxLength={2}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      padding: 12,
                      color: colors.foreground,
                      backgroundColor: colors.surface,
                      textAlign: "center",
                    }}
                  />
                  <Text className="text-2xl text-foreground">:</Text>
                  <TextInput
                    placeholder="MM"
                    placeholderTextColor={colors.muted}
                    value={endMinute}
                    onChangeText={setEndMinute}
                    keyboardType="number-pad"
                    maxLength={2}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      padding: 12,
                      color: colors.foreground,
                      backgroundColor: colors.surface,
                      textAlign: "center",
                    }}
                  />
                </View>
              </View>

              {/* Days of Week */}
              <View className="gap-2 mb-6">
                <Text className="text-sm font-semibold text-foreground">曜日</Text>
                <View className="flex-row gap-2 flex-wrap">
                  {DAYS_OF_WEEK.map((day, index) => (
                    <Pressable
                      key={index}
                      onPress={() => toggleDay(index)}
                      style={({ pressed }) => [
                        {
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          backgroundColor: selectedDays.includes(index)
                            ? colors.primary
                            : colors.surface,
                          borderWidth: 1,
                          borderColor: colors.border,
                          opacity: pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <Text
                        className={`font-semibold ${
                          selectedDays.includes(index)
                            ? "text-background"
                            : "text-foreground"
                        }`}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowModal(false)}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center font-semibold text-foreground">キャンセル</Text>
              </Pressable>
              <Pressable
                onPress={handleAddGoal}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <Text className="text-center font-semibold text-background">保存</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
