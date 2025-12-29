import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

export interface SessionData {
  id: string;
  date: string;
  startTime: number;
  endTime?: number;
  duration: number; // ミリ秒
}

export interface DailyStats {
  date: string;
  screenTime: number; // ミリ秒
  detoxTime: number; // ミリ秒
  sessions: SessionData[];
}

export interface TimeRestriction {
  id: string;
  name: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  daysOfWeek: number[]; // 0=Sunday, 6=Saturday
  enabled: boolean;
}

export interface DetoxContextType {
  // 統計データ
  todayStats: DailyStats | null;
  allStats: Record<string, DailyStats>;
  
  // セッション管理
  currentSession: SessionData | null;
  isDetoxing: boolean;
  currentDetoxTime: number; // ミリ秒
  
  // 目標設定
  timeRestrictions: TimeRestriction[];
  
  // アクション
  startDetox: () => Promise<void>;
  endDetox: () => Promise<void>;
  addTimeRestriction: (restriction: TimeRestriction) => Promise<void>;
  updateTimeRestriction: (id: string, restriction: TimeRestriction) => Promise<void>;
  deleteTimeRestriction: (id: string) => Promise<void>;
  loadData: () => Promise<void>;
}

const DetoxContext = createContext<DetoxContextType | undefined>(undefined);

export function DetoxProvider({ children }: { children: ReactNode }) {
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [allStats, setAllStats] = useState<Record<string, DailyStats>>({});
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [isDetoxing, setIsDetoxing] = useState(false);
  const [currentDetoxTime, setCurrentDetoxTime] = useState(0);
  const [timeRestrictions, setTimeRestrictions] = useState<TimeRestriction[]>([]);
  const [appState, setAppState] = useState<AppStateStatus>('active');

  // 今日の日付を取得
  const getTodayDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // データをロード
  const loadData = async () => {
    try {
      const [statsData, restrictionsData, sessionData] = await Promise.all([
        AsyncStorage.getItem('detox_stats'),
        AsyncStorage.getItem('detox_restrictions'),
        AsyncStorage.getItem('detox_current_session'),
      ]);

      if (statsData) {
        const parsed = JSON.parse(statsData);
        setAllStats(parsed);
        
        const today = getTodayDate();
        setTodayStats(parsed[today] || createEmptyDailyStats(today));
      } else {
        const today = getTodayDate();
        setTodayStats(createEmptyDailyStats(today));
      }

      if (restrictionsData) {
        setTimeRestrictions(JSON.parse(restrictionsData));
      }

      if (sessionData) {
        const session = JSON.parse(sessionData);
        setCurrentSession(session);
        setIsDetoxing(true);
      }
    } catch (error) {
      console.error('Error loading detox data:', error);
    }
  };

  // 放置を開始
  const startDetox = async () => {
    const now = Date.now();
    const newSession: SessionData = {
      id: `session_${now}`,
      date: getTodayDate(),
      startTime: now,
      duration: 0,
    };

    setCurrentSession(newSession);
    setIsDetoxing(true);
    await AsyncStorage.setItem('detox_current_session', JSON.stringify(newSession));
  };

  // 放置を終了
  const endDetox = async () => {
    if (!currentSession) return;

    const endTime = Date.now();
    const duration = endTime - currentSession.startTime;
    const completedSession: SessionData = {
      ...currentSession,
      endTime,
      duration,
    };

    // 統計を更新
    const today = getTodayDate();
    const updatedStats = { ...allStats };
    if (!updatedStats[today]) {
      updatedStats[today] = createEmptyDailyStats(today);
    }
    updatedStats[today].detoxTime += duration;
    updatedStats[today].sessions.push(completedSession);

    setAllStats(updatedStats);
    setTodayStats(updatedStats[today]);
    setCurrentSession(null);
    setIsDetoxing(false);
    setCurrentDetoxTime(0);

    await Promise.all([
      AsyncStorage.removeItem('detox_current_session'),
      AsyncStorage.setItem('detox_stats', JSON.stringify(updatedStats)),
    ]);
  };

  // 時間制限を追加
  const addTimeRestriction = async (restriction: TimeRestriction) => {
    const updated = [...timeRestrictions, restriction];
    setTimeRestrictions(updated);
    await AsyncStorage.setItem('detox_restrictions', JSON.stringify(updated));
  };

  // 時間制限を更新
  const updateTimeRestriction = async (id: string, restriction: TimeRestriction) => {
    const updated = timeRestrictions.map(r => r.id === id ? restriction : r);
    setTimeRestrictions(updated);
    await AsyncStorage.setItem('detox_restrictions', JSON.stringify(updated));
  };

  // 時間制限を削除
  const deleteTimeRestriction = async (id: string) => {
    const updated = timeRestrictions.filter(r => r.id !== id);
    setTimeRestrictions(updated);
    await AsyncStorage.setItem('detox_restrictions', JSON.stringify(updated));
  };

  // アプリがフォアグラウンドに戻ったときの処理
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [currentSession, isDetoxing]);

  const handleAppStateChange = async (state: AppStateStatus) => {
    if (state === 'active' && isDetoxing && currentSession) {
      // アプリがバックグラウンドから戻ってきた場合、放置時間を更新
      const now = Date.now();
      const elapsedTime = now - currentSession.startTime;
      setCurrentDetoxTime(elapsedTime);
    }
    setAppState(state);
  };

  // 放置中の時間を更新
  useEffect(() => {
    if (!isDetoxing || !currentSession) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedTime = now - currentSession.startTime;
      setCurrentDetoxTime(elapsedTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [isDetoxing, currentSession]);

  // 初期化時にデータをロード
  useEffect(() => {
    loadData();
  }, []);

  const value: DetoxContextType = {
    todayStats,
    allStats,
    currentSession,
    isDetoxing,
    currentDetoxTime,
    timeRestrictions,
    startDetox,
    endDetox,
    addTimeRestriction,
    updateTimeRestriction,
    deleteTimeRestriction,
    loadData,
  };

  return <DetoxContext.Provider value={value}>{children}</DetoxContext.Provider>;
}

export function useDetox() {
  const context = useContext(DetoxContext);
  if (!context) {
    throw new Error('useDetox must be used within DetoxProvider');
  }
  return context;
}

function createEmptyDailyStats(date: string): DailyStats {
  return {
    date,
    screenTime: 0,
    detoxTime: 0,
    sessions: [],
  };
}
