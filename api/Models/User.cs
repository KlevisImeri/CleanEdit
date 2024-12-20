public class User {
  public int Id { get; set; }
  public string Username { get; set; }
  public string Password { get; set; }
  public string Email { get; set; }
  public ICollection<Project> Projects { get; set; } = new List<Project>();
}