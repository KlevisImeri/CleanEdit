public class Project {
  public int Id { get; set; }
  public string Name { get; set; }
  public string ProjectFilePath { get; set; } // Path to the project file (txt file)
  public int UserId { get; set; }
  public User User { get; set; }
  public int VideoId { get; set; }
  public Video Video { get; set; }
}