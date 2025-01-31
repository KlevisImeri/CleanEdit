using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext {
  public DbSet<Video> Videos { get; set; } = null!;
  public DbSet<Project> Projects { get; set; } = null!;
  public DbSet<User> Users { get; set; } = null!;
  public DbSet<Track> Tracks { get; set; } = null!;
  public DbSet<Segment> Segments { get; set; } = null!;

  public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

  protected override void OnModelCreating(ModelBuilder modelBuilder) {
    base.OnModelCreating(modelBuilder);
  }
}
