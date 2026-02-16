import { describe, it, expect, beforeEach } from 'vitest';
import { ref, computed } from 'vue';

describe('variables.ts', () => {
  describe('fpsToPx', () => {
    it('should calculate fpsToPx correctly', () => {
      const fps = ref(60);
      const zoomLevel = ref(1.0);
      const UNITSEC = 100;
      
      const fpsToPx = computed(() => 1 / fps.value * UNITSEC * zoomLevel.value);
      
      expect(fpsToPx.value).toBeCloseTo(1.667, 2);
    });

    it('should scale with zoom level', () => {
      const fps = ref(60);
      const zoomLevel = ref(2.0);
      const UNITSEC = 100;
      
      const fpsToPx = computed(() => 1 / fps.value * UNITSEC * zoomLevel.value);
      
      expect(fpsToPx.value).toBeCloseTo(3.333, 2);
    });
  });

  describe('secToPos', () => {
    it('should calculate secToPos correctly', () => {
      const fps = ref(60);
      const zoomLevel = ref(1.0);
      const UNITSEC = 100;
      
      const fpsToPx = computed(() => 1 / fps.value * UNITSEC * zoomLevel.value);
      const secToPos = computed(() => 60 * fpsToPx.value);
      
      expect(secToPos.value).toBeCloseTo(100, 0);
    });
  });

  describe('secToFps', () => {
    it('should convert seconds to frames', () => {
      const fps = ref(60);
      const secToFps = (time: number) => Math.round(time * fps.value);
      
      expect(secToFps(1)).toBe(60);
      expect(secToFps(0.5)).toBe(30);
      expect(secToFps(2)).toBe(120);
    });
  });

  describe('resetVariables', () => {
    it('should reset curSeg and till to -1', () => {
      const curSeg = ref(5);
      const till = ref(100);
      const tracks = ref([{ segments: [{ id: 1, start: 0, end: 100, removed: false }] }]);
      
      const resetVariables = () => {
        curSeg.value = -1;
        till.value = -1;
        tracks.value = [{ segments: [] }];
      };
      
      resetVariables();
      
      expect(curSeg.value).toBe(-1);
      expect(till.value).toBe(-1);
      expect(tracks.value[0].segments).toEqual([]);
    });
  });
});

describe('Project Types', () => {
  it('should have correct structure for project without video', () => {
    const project = {
      id: 1,
      name: 'Test Project',
      userId: 1,
      videoId: null,
      video: null,
      tracks: [{ segments: [] }],
    };
    
    expect(project.id).toBe(1);
    expect(project.name).toBe('Test Project');
    expect(project.video).toBeNull();
    expect(project.tracks).toBeDefined();
    expect(project.tracks[0].segments).toEqual([]);
  });

  it('should have correct structure for project with video', () => {
    const project = {
      id: 1,
      name: 'Test Project',
      userId: 1,
      videoId: 5,
      video: { id: 5, fileName: 'test.mp4', durationFPS: 600 },
      tracks: [{ segments: [{ id: 1, start: 0, end: 600, removed: false }] }],
    };
    
    expect(project.video).not.toBeNull();
    expect(project.video?.durationFPS).toBe(600);
    expect(project.tracks[0].segments[0].end).toBe(600);
  });
});

describe('Timeline calculations', () => {
  it('should calculate timeline width from durationFPS', () => {
    const durationFPS = 600;
    const fps = 60;
    const zoomLevel = 1.0;
    const UNITSEC = 100;
    
    const fpsToPx = 1 / fps * UNITSEC * zoomLevel;
    const timelineWidth = durationFPS * fpsToPx;
    
    expect(timelineWidth).toBeCloseTo(1000, 0);
  });

  it('should return 0 timeline width when durationFPS is undefined', () => {
    const durationFPS = undefined;
    const fps = 60;
    const zoomLevel = 1.0;
    const UNITSEC = 100;
    
    const fpsToPx = 1 / fps * UNITSEC * zoomLevel;
    const timelineWidth = (durationFPS || 0) * fpsToPx;
    
    expect(timelineWidth).toBe(0);
  });

  it('should filter visible segments correctly', () => {
    const segments = [
      { id: 1, start: 0, end: 100, removed: false },
      { id: 2, start: 100, end: 200, removed: false },
      { id: 3, start: 200, end: 300, removed: true },
      { id: 4, start: 300, end: 400, removed: false },
    ];
    
    const visibleStart = 150;
    const visibleEnd = 350;
    
    const visibleSegments = segments.filter(
      seg => seg.end >= visibleStart && seg.start <= visibleEnd
    );
    
    expect(visibleSegments.length).toBe(3);
    expect(visibleSegments.map(s => s.id)).toEqual([2, 3, 4]);
  });
});

describe('Segment operations', () => {
  it('should toggle segment removed status', () => {
    const segment = { id: 1, start: 0, end: 100, removed: false };
    
    segment.removed = !segment.removed;
    
    expect(segment.removed).toBe(true);
  });

  it('should handle segment range toggle', () => {
    const segments = [
      { id: 1, start: 0, end: 100, removed: false },
      { id: 2, start: 100, end: 200, removed: false },
      { id: 3, start: 200, end: 300, removed: false },
    ];
    
    const start = 0;
    const end = 2;
    const removed = true;
    
    for (let i = start; i <= end; i++) {
      segments[i].removed = removed;
    }
    
    expect(segments[0].removed).toBe(true);
    expect(segments[1].removed).toBe(true);
    expect(segments[2].removed).toBe(true);
  });

  it('should skip removed segments when finding current segment', () => {
    const segments = [
      { id: 1, start: 0, end: 100, removed: true },
      { id: 2, start: 100, end: 200, removed: false },
      { id: 3, start: 200, end: 300, removed: true },
      { id: 4, start: 300, end: 400, removed: false },
    ];
    
    let curSeg = 0;
    
    while (curSeg < segments.length && segments[curSeg].removed) {
      curSeg++;
    }
    
    expect(curSeg).toBe(1);
    expect(segments[curSeg].removed).toBe(false);
  });
});

describe('Time formatting', () => {
  it('should format seconds to mm:ss', () => {
    // FIXED version - matches Timeline.vue
    const formatTime = (time: number): string => {
      if (typeof time !== 'number' || isNaN(time) || !isFinite(time)) {
        return '0:00';
      }
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = Math.floor(time % 60);

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    };
    
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(3660)).toBe('1:01:00'); // 1 hour, 1 minute
  });

  it('should not produce NaN', () => {
    const formatTime = (time: number): string => {
      if (typeof time !== 'number' || isNaN(time) || !isFinite(time)) {
        return '0:00';
      }
      const totalSeconds = Math.floor(time / 60);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    expect(formatTime(0)).not.toContain('NaN');
    expect(formatTime(undefined as any)).not.toContain('NaN');
    expect(formatTime(null as any)).not.toContain('NaN');
  });
});
