public class Segment
{
  public int Id { get; set; }
  public double Start { get; set; }
  public double End { get; set; }
  public bool Removed { get; set; }
  public int TrackId { get; set; }
  public Track Track { get; set; }
}
