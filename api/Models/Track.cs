public class Track
{
  public int Id { get; set; }
  public List<Segment> Segments { get; set; } = new();
  public int ProjectId { get; set; }
  public Project Project { get; set; }
}
