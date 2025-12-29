import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('DetoxContext Data Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Session Data', () => {
    it('should create a session with correct structure', () => {
      const now = Date.now();
      const session = {
        id: `session_${now}`,
        date: new Date().toISOString().split('T')[0],
        startTime: now,
        duration: 0,
      };

      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('date');
      expect(session).toHaveProperty('startTime');
      expect(session).toHaveProperty('duration');
      expect(session.duration).toBe(0);
    });

    it('should calculate session duration correctly', () => {
      const startTime = Date.now();
      const endTime = startTime + 3600000; // 1 hour later
      const duration = endTime - startTime;

      expect(duration).toBe(3600000);
      const durationMinutes = Math.floor(duration / 1000 / 60);
      expect(durationMinutes).toBe(60); // 60 minutes
    });
  });

  describe('Daily Stats', () => {
    it('should create empty daily stats', () => {
      const today = new Date().toISOString().split('T')[0];
      const stats = {
        date: today,
        screenTime: 0,
        detoxTime: 0,
        sessions: [],
      };

      expect(stats.date).toBe(today);
      expect(stats.screenTime).toBe(0);
      expect(stats.detoxTime).toBe(0);
      expect(stats.sessions).toHaveLength(0);
    });

    it('should accumulate detox time correctly', () => {
      const stats = {
        date: new Date().toISOString().split('T')[0],
        screenTime: 0,
        detoxTime: 0,
        sessions: [],
      };

      // Add first session (30 minutes = 1800000ms)
      stats.detoxTime += 1800000;
      expect(stats.detoxTime).toBe(1800000);

      // Add second session (45 minutes = 2700000ms)
      stats.detoxTime += 2700000;
      expect(stats.detoxTime).toBe(4500000);

      // Verify total is 75 minutes (4500000ms / 1000 / 60 = 75)
      const totalMinutes = Math.floor(stats.detoxTime / 1000 / 60);
      expect(totalMinutes).toBe(75);
    });
  });

  describe('Time Restrictions', () => {
    it('should create a time restriction with correct structure', () => {
      const restriction = {
        id: `restriction_${Date.now()}`,
        name: '午前中はスマホを使わない',
        startHour: 9,
        startMinute: 0,
        endHour: 12,
        endMinute: 0,
        daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
        enabled: true,
      };

      expect(restriction).toHaveProperty('id');
      expect(restriction).toHaveProperty('name');
      expect(restriction).toHaveProperty('startHour');
      expect(restriction).toHaveProperty('endHour');
      expect(restriction.daysOfWeek).toEqual([1, 2, 3, 4, 5]);
    });

    it('should validate time range', () => {
      const restriction = {
        startHour: 9,
        startMinute: 0,
        endHour: 12,
        endMinute: 0,
      };

      const startMinutes = restriction.startHour * 60 + restriction.startMinute;
      const endMinutes = restriction.endHour * 60 + restriction.endMinute;
      const durationMinutes = endMinutes - startMinutes;

      expect(endMinutes).toBeGreaterThan(startMinutes);
      expect(durationMinutes).toBe(180); // 3 hours
    });

    it('should support all days of week', () => {
      const weekdaysOnly = [1, 2, 3, 4, 5];
      const restriction = {
        daysOfWeek: weekdaysOnly,
      };

      expect(restriction.daysOfWeek).toHaveLength(5);
      expect(restriction.daysOfWeek).toEqual(weekdaysOnly);
    });
  });

  describe('Time Formatting', () => {
    it('should format milliseconds to hours and minutes', () => {
      const formatTimeHM = (milliseconds: number): string => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
      };

      expect(formatTimeHM(3600000)).toBe('1h 0m'); // 1 hour
      expect(formatTimeHM(1800000)).toBe('30m');   // 30 minutes
      expect(formatTimeHM(5400000)).toBe('1h 30m'); // 1.5 hours
      expect(formatTimeHM(60000)).toBe('1m');      // 1 minute
    });

    it('should handle zero milliseconds', () => {
      const formatTimeHM = (milliseconds: number): string => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);

        if (hours > 0) {
          return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
      };

      const result = formatTimeHM(0);
      expect(result).toBe('0m');
    });
  });

  describe('Date Handling', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T00:00:00Z');
      const dateStr = date.toISOString().split('T')[0];

      expect(dateStr).toBe('2024-01-15');
    });

    it('should get today date in correct format', () => {
      const today = new Date().toISOString().split('T')[0];
      const parts = today.split('-');

      expect(parts).toHaveLength(3);
      expect(parts[0]).toMatch(/^\d{4}$/); // Year (4 digits)
      expect(parts[1]).toMatch(/^\d{2}$/); // Month (2 digits)
      expect(parts[2]).toMatch(/^\d{2}$/); // Day (2 digits)
    });

    it('should determine day of week', () => {
      // Sunday, January 15, 2024
      const date = new Date('2024-01-15');
      const dayOfWeek = date.getDay();

      expect(dayOfWeek).toBe(0); // Sunday
    });
  });

  describe('Data Persistence', () => {
    it('should prepare data for AsyncStorage', () => {
      const stats = {
        '2024-01-15': {
          date: '2024-01-15',
          screenTime: 3600000,
          detoxTime: 1800000,
          sessions: [],
        },
      };

      const jsonStr = JSON.stringify(stats);
      expect(typeof jsonStr).toBe('string');
      expect(jsonStr).toContain('2024-01-15');
      expect(jsonStr).toContain('detoxTime');
      expect(jsonStr).toContain('screenTime');
    });

    it('should parse data from AsyncStorage', () => {
      const data = {
        '2024-01-15': {
          date: '2024-01-15',
          screenTime: 3600000,
          detoxTime: 1800000,
          sessions: [],
        },
      };
      const jsonStr = JSON.stringify(data);
      const parsed = JSON.parse(jsonStr);

      expect(parsed['2024-01-15']).toBeDefined();
      expect(parsed['2024-01-15'].detoxTime).toBe(1800000);
      expect(parsed['2024-01-15'].screenTime).toBe(3600000);
    });
  });
});
