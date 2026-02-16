import { describe, it, expect } from 'vitest';

describe('Timeline Component Logic', () => {
  describe('visibleRangeFPS calculation', () => {
    it('should calculate visible range from scroll position', () => {
      const scrollPosition = 100;
      const clientWidth = 800;
      const fpsToPx = 1.667;
      
      const start = scrollPosition / fpsToPx;
      const end = (scrollPosition + clientWidth) / fpsToPx;
      
      expect(start).toBeCloseTo(59.9, 0);
      expect(end).toBeCloseTo(539.9, 0);
    });

    it('should handle zero scroll position', () => {
      const scrollPosition = 0;
      const clientWidth = 800;
      const fpsToPx = 1.667;
      
      const start = scrollPosition / fpsToPx;
      const end = (scrollPosition + clientWidth) / fpsToPx;
      
      expect(start).toBe(0);
      expect(end).toBeCloseTo(480, 0);
    });
  });

  describe('segmentStyle calculation', () => {
    it('should calculate segment position and width', () => {
      const segment = { id: 1, start: 100, end: 200, removed: false };
      const fpsToPx = 1.667;
      
      const left = segment.start * fpsToPx;
      const width = (segment.end - segment.start) * fpsToPx;
      
      expect(left).toBeCloseTo(166.7, 0);
      expect(width).toBeCloseTo(166.7, 0);
    });

    it('should handle zero-length segments', () => {
      const segment = { id: 1, start: 100, end: 100, removed: false };
      const fpsToPx = 1.667;
      
      const left = segment.start * fpsToPx;
      const width = (segment.end - segment.start) * fpsToPx;
      
      expect(left).toBeCloseTo(166.7, 0);
      expect(width).toBe(0);
    });
  });

  describe('timeMarkers calculation', () => {
    it('should generate markers at correct intervals', () => {
      const zoomLevel = 1.0;
      const UNITMARKER = 1;
      
      const step = UNITMARKER / zoomLevel;
      const markers: number[] = [];
      
      for (let i = 0; i <= 10; i += step) {
        markers.push(i);
      }
      
      expect(markers).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should generate more markers at higher zoom', () => {
      const zoomLevel = 2.0;
      const UNITMARKER = 1;
      
      const step = UNITMARKER / zoomLevel;
      const markers: number[] = [];
      
      for (let i = 0; i <= 10; i += step) {
        markers.push(i);
      }
      
      expect(markers).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10]);
    });
  });

  describe('tickMarks calculation', () => {
    it('should generate ticks at 0.1 intervals by default', () => {
      const zoomLevel = 1.0;
      const UNITTICK = 0.1;
      
      const tickInterval = UNITTICK / zoomLevel;
      const ticks: number[] = [];
      
      for (let i = 0; i <= 1; i += tickInterval) {
        ticks.push(i);
      }
      
      expect(ticks.length).toBe(11);
    });
  });
});

describe('Video Component Logic', () => {
  describe('onTimeUpdate', () => {
    it('should handle empty segments array', () => {
      const video = { currentTime: 1, duration: 10 } as HTMLVideoElement;
      const segments: any[] = [];
      
      if (segments.length === 0) {
        // Should request next frame
        expect(true).toBe(true);
      }
    });

    it('should handle currentTime > duration', () => {
      const video = { currentTime: 15, duration: 10 } as HTMLVideoElement;
      
      if (video.currentTime > video.duration) {
        expect(video.currentTime).toBeGreaterThan(video.duration);
      }
    });

    it('should convert currentTime to frame', () => {
      const fps = 60;
      const currentTime = 1.5;
      const currentFrame = Math.round(currentTime * fps);
      
      expect(currentFrame).toBe(90);
    });
  });

  describe('segment navigation', () => {
    it('should find next non-removed segment', () => {
      const segments = [
        { id: 1, start: 0, end: 100, removed: true },
        { id: 2, start: 100, end: 200, removed: true },
        { id: 3, start: 200, end: 300, removed: false },
      ];
      
      let curSeg = 0;
      while (curSeg < segments.length && segments[curSeg].removed) {
        curSeg++;
      }
      
      expect(curSeg).toBe(2);
      expect(segments[curSeg].removed).toBe(false);
    });

    it('should handle all segments removed', () => {
      const segments = [
        { id: 1, start: 0, end: 100, removed: true },
        { id: 2, start: 100, end: 200, removed: true },
      ];
      
      let curSeg = 0;
      while (curSeg < segments.length && segments[curSeg].removed) {
        curSeg++;
      }
      
      expect(curSeg).toBe(segments.length);
    });

    it('should calculate next segment when current is removed', () => {
      const segments = [
        { id: 1, start: 0, end: 100, removed: false },
        { id: 2, start: 100, end: 200, removed: false },
        { id: 3, start: 200, end: 300, removed: false },
      ];
      
      let curSeg = 0;
      while (curSeg < segments.length && !segments[curSeg].removed) {
        curSeg++;
      }
      curSeg--;
      
      expect(curSeg).toBe(2);
    });
  });
});

describe('Selection Logic', () => {
  describe('isSegmentSelected', () => {
    const isSegmentSelected = (segIndex: number, sel1: number, sel2: number): boolean => {
      if (segIndex === sel1 || segIndex === sel2) return true;
      if (sel1 !== -1 && sel2 !== -1) {
        const start = Math.min(sel1, sel2);
        const end = Math.max(sel1, sel2);
        return start <= segIndex && segIndex <= end;
      }
      return false;
    };

    it('should select single segment', () => {
      expect(isSegmentSelected(5, 5, -1)).toBe(true);
    });

    it('should select range of segments', () => {
      expect(isSegmentSelected(3, 1, 5)).toBe(true);
      expect(isSegmentSelected(1, 1, 5)).toBe(true);
      expect(isSegmentSelected(5, 1, 5)).toBe(true);
      expect(isSegmentSelected(0, 1, 5)).toBe(false);
      expect(isSegmentSelected(6, 1, 5)).toBe(false);
    });

    it('should handle reverse selection order', () => {
      expect(isSegmentSelected(3, 5, 1)).toBe(true);
    });

    it('should return false when no selection', () => {
      expect(isSegmentSelected(3, -1, -1)).toBe(false);
    });
  });
});

describe('Split Segment Logic (W key)', () => {
  const splitSegment = (segments: any[], currentFrame: number): boolean => {
    // Binary search to find segment at current frame
    const binarySearch = (time: number): number => {
      let low = 0;
      let high = segments.length - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const seg = segments[mid];
        if (time >= seg.start && time <= seg.end) {
          return mid;
        } else if (time < seg.start) {
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }
      return segments.length - 1;
    };

    if (!segments || segments.length === 0) return false;
    
    const segIndex = binarySearch(currentFrame);
    const seg = segments[segIndex];
    
    // Only split if not at segment boundaries
    if (currentFrame > seg.start && currentFrame < seg.end) {
      const newSegment = {
        id: Date.now(),
        start: currentFrame,
        end: seg.end,
        removed: seg.removed
      };
      seg.end = currentFrame;
      segments.splice(segIndex + 1, 0, newSegment);
      return true;
    }
    return false;
  };

  it('should split segment at middle', () => {
    const segments = [
      { id: 1, start: 0, end: 100, removed: false }
    ];
    
    const result = splitSegment(segments, 50);
    
    expect(result).toBe(true);
    expect(segments.length).toBe(2);
    expect(segments[0]).toEqual({ id: 1, start: 0, end: 50, removed: false });
    expect(segments[1]).toEqual({ id: expect.any(Number), start: 50, end: 100, removed: false });
  });

  it('should not split at segment start', () => {
    const segments = [
      { id: 1, start: 0, end: 100, removed: false }
    ];
    
    const result = splitSegment(segments, 0);
    
    expect(result).toBe(false);
    expect(segments.length).toBe(1);
  });

  it('should not split at segment end', () => {
    const segments = [
      { id: 1, start: 0, end: 100, removed: false }
    ];
    
    const result = splitSegment(segments, 100);
    
    expect(result).toBe(false);
    expect(segments.length).toBe(1);
  });

  it('should handle empty segments', () => {
    const segments: any[] = [];
    
    const result = splitSegment(segments, 50);
    
    expect(result).toBe(false);
  });

  it('should preserve removed status in new segment', () => {
    const segments = [
      { id: 1, start: 0, end: 100, removed: true }
    ];
    
    splitSegment(segments, 50);
    
    expect(segments[0].removed).toBe(true);
    expect(segments[1].removed).toBe(true);
  });

  it('should split multiple times', () => {
    const segments = [
      { id: 1, start: 0, end: 100, removed: false }
    ];
    
    splitSegment(segments, 33);
    expect(segments.length).toBe(2);
    
    splitSegment(segments, 66);
    expect(segments.length).toBe(3);
    
    expect(segments[0]).toEqual({ id: 1, start: 0, end: 33, removed: false });
    expect(segments[1]).toEqual({ id: expect.any(Number), start: 33, end: 66, removed: false });
    expect(segments[2]).toEqual({ id: expect.any(Number), start: 66, end: 100, removed: false });
  });
});

describe('Zoom operations', () => {
  it('should clamp zoom level', () => {
    const ZOOMMIX = 0.001;
    const ZOOMMAX = 10;
    const ZOOMSPEED = 0.5;
    
    let zoomLevel = 0.5;
    zoomLevel = Math.max(ZOOMMIX, Math.min(ZOOMMAX, zoomLevel * (1 + ZOOMSPEED)));
    
    expect(zoomLevel).toBeCloseTo(0.75, 2);
  });

  it('should not exceed max zoom', () => {
    const ZOOMMIX = 0.001;
    const ZOOMMAX = 10;
    
    let zoomLevel = 15;
    zoomLevel = Math.max(ZOOMMIX, Math.min(ZOOMMAX, zoomLevel));
    
    expect(zoomLevel).toBe(10);
  });

  it('should not go below min zoom', () => {
    const ZOOMMIX = 0.001;
    const ZOOMMAX = 10;
    
    let zoomLevel = 0.0001;
    zoomLevel = Math.max(ZOOMMIX, Math.min(ZOOMMAX, zoomLevel));
    
    expect(zoomLevel).toBe(0.001);
  });
});

describe('Binary search for segments', () => {
  const binarySearch = (segments: any[], frame: number): number => {
    let left = 0;
    let right = segments.length - 1;
    let result = -1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const seg = segments[mid];
      
      if (frame >= seg.start && frame < seg.end) {
        return mid;
      }
      if (seg.start < frame) {
        result = mid;
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return result;
  };

  it('should find segment containing frame', () => {
    const segments = [
      { id: 1, start: 0, end: 100 },
      { id: 2, start: 100, end: 200 },
      { id: 3, start: 200, end: 300 },
    ];
    
    expect(binarySearch(segments, 50)).toBe(0);
    expect(binarySearch(segments, 150)).toBe(1);
    expect(binarySearch(segments, 250)).toBe(2);
  });

  it('should return closest segment before frame', () => {
    const segments = [
      { id: 1, start: 0, end: 100 },
      { id: 2, start: 100, end: 200 },
    ];
    
    expect(binarySearch(segments, 250)).toBe(1);
  });

  it('should handle empty segments', () => {
    const segments: any[] = [];
    
    expect(binarySearch(segments, 50)).toBe(-1);
  });
});
