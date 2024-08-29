export type Segment = {
  start: number,
  end: number,
  removed: boolean,
};

export type Track = {
  segments: Segment[],
};