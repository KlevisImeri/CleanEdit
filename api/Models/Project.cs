public class Project
{
  public int Id { get; set; }
  public string Name { get; set; }
  public int UserId { get; set; }
  public User User { get; set; }
  public int? VideoId { get; set; }
  public Video Video { get; set; }
  public List<Track> Tracks { get; set; } = new();
}
