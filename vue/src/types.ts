export type Segment = {
  id: number,
  start: number,
  end: number,
  removed: boolean,
};

export type Track = {
  segments: Segment[],
};

export type Video = {
  id: number,
  fileName: string,
  durationFPS: number,
}

export type Project = {
  id: number,
  name: string,
  video: Video,
  tracks: Track[],
}

