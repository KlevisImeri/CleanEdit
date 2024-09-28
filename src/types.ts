export type Segment = {
  id: number,
  start: number,
  end: number,
  removed: boolean,
};

export type Track = {
  segments: Segment[],
};