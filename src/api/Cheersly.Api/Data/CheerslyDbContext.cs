using Microsoft.EntityFrameworkCore;
using Cheersly.Api.Models;

namespace Cheersly.Api.Data;

/// <summary>
/// Database context for the Cheersly application.
/// </summary>
public class CheerslyDbContext : DbContext
{
    public CheerslyDbContext(DbContextOptions<CheerslyDbContext> options)
        : base(options)
    {
    }
    
    /// <summary>
    /// Users in the system.
    /// </summary>
    public DbSet<User> Users { get; set; } = null!;
    
    /// <summary>
    /// Cheers (recognition messages with points).
    /// </summary>
    public DbSet<Cheer> Cheers { get; set; } = null!;
    
    /// <summary>
    /// Recipients of cheers.
    /// </summary>
    public DbSet<CheerRecipient> CheerRecipients { get; set; } = null!;
    
    /// <summary>
    /// Store items available for purchase with points.
    /// </summary>
    public DbSet<StoreItem> StoreItems { get; set; } = null!;
    
    /// <summary>
    /// Orders (redemptions) of store items.
    /// </summary>
    public DbSet<Order> Orders { get; set; } = null!;
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Configure User entity
        modelBuilder.Entity<User>(entity =>
        {
            // Primary key
            entity.HasKey(e => e.Id);
            
            // Email configuration
            entity.Property(e => e.Email)
                .IsRequired()
                .HasMaxLength(256);
            
            // Unique index on Email
            entity.HasIndex(e => e.Email)
                .IsUnique()
                .HasDatabaseName("IX_Users_Email");
            
            // FirstName configuration
            entity.Property(e => e.FirstName)
                .IsRequired()
                .HasMaxLength(100);
            
            // LastName configuration
            entity.Property(e => e.LastName)
                .IsRequired()
                .HasMaxLength(100);
            
            // PointsToGive configuration with default value and check constraint
            entity.Property(e => e.PointsToGive)
                .HasDefaultValue(50)
                .IsRequired();
            
            // Add check constraint for PointsToGive >= 0
            entity.ToTable(t => t.HasCheckConstraint("CK_User_PointsToGive", "\"PointsToGive\" >= 0"));
            
            // PointsReceived configuration with default value and check constraint
            entity.Property(e => e.PointsReceived)
                .HasDefaultValue(0)
                .IsRequired();
            
            // Add check constraint for PointsReceived >= 0
            entity.ToTable(t => t.HasCheckConstraint("CK_User_PointsReceived", "\"PointsReceived\" >= 0"));
            
            // CreatedAt configuration with default value
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .IsRequired();
            
            // LastLoginAt configuration with default value
            entity.Property(e => e.LastLoginAt)
                .HasDefaultValueSql("NOW()")
                .IsRequired();
            
            // LastPointsReset configuration with default value
            entity.Property(e => e.LastPointsReset)
                .HasDefaultValueSql("NOW()")
                .IsRequired();
        });
        
        // Configure Cheer entity
        modelBuilder.Entity<Cheer>(entity =>
        {
            // Primary key
            entity.HasKey(e => e.Id);
            
            // Message configuration
            entity.Property(e => e.Message)
                .IsRequired()
                .HasMaxLength(2000);
            
            // PointsPerRecipient configuration with check constraint
            entity.Property(e => e.PointsPerRecipient)
                .IsRequired();
            
            entity.ToTable(t => t.HasCheckConstraint("CK_Cheer_PointsPerRecipient", "\"PointsPerRecipient\" > 0"));
            
            // CreatedAt configuration
            entity.Property(e => e.CreatedAt)
                .IsRequired();
            
            // Foreign key to Sender
            entity.HasOne(e => e.Sender)
                .WithMany()
                .HasForeignKey(e => e.SenderId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Index on SenderId for efficient queries
            entity.HasIndex(e => e.SenderId)
                .HasDatabaseName("IX_Cheers_SenderId");
            
            // Index on CreatedAt DESC for feed queries
            entity.HasIndex(e => e.CreatedAt)
                .IsDescending()
                .HasDatabaseName("IX_Cheers_CreatedAt");
        });
        
        // Configure CheerRecipient entity
        modelBuilder.Entity<CheerRecipient>(entity =>
        {
            // Primary key
            entity.HasKey(e => e.Id);
            
            // PointsAwarded configuration with check constraint
            entity.Property(e => e.PointsAwarded)
                .IsRequired();
            
            entity.ToTable(t => t.HasCheckConstraint("CK_CheerRecipient_PointsAwarded", "\"PointsAwarded\" > 0"));
            
            // Foreign key to Cheer
            entity.HasOne(e => e.Cheer)
                .WithMany(c => c.Recipients)
                .HasForeignKey(e => e.CheerId)
                .OnDelete(DeleteBehavior.Cascade);
            
            // Foreign key to Recipient
            entity.HasOne(e => e.Recipient)
                .WithMany()
                .HasForeignKey(e => e.RecipientId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Index on CheerId for efficient queries
            entity.HasIndex(e => e.CheerId)
                .HasDatabaseName("IX_CheerRecipients_CheerId");
            
            // Index on RecipientId for efficient queries
            entity.HasIndex(e => e.RecipientId)
                .HasDatabaseName("IX_CheerRecipients_RecipientId");
        });
        
        // Configure StoreItem entity
        modelBuilder.Entity<StoreItem>(entity =>
        {
            // Primary key
            entity.HasKey(e => e.Id);
            
            // Name configuration with unique constraint
            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);
            
            entity.HasIndex(e => e.Name)
                .IsUnique()
                .HasDatabaseName("IX_StoreItems_Name");
            
            // Description configuration
            entity.Property(e => e.Description)
                .IsRequired()
                .HasMaxLength(2000);
            
            // PointCost configuration with check constraint
            entity.Property(e => e.PointCost)
                .IsRequired();
            
            entity.ToTable(t => t.HasCheckConstraint("CK_StoreItem_PointCost", "\"PointCost\" > 0"));
            
            // ImageUrl configuration
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(500);
            
            // Category configuration
            entity.Property(e => e.Category)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("Other");
            
            // QuantityAvailable configuration with check constraint
            entity.ToTable(t => t.HasCheckConstraint("CK_StoreItem_QuantityAvailable", "\"QuantityAvailable\" IS NULL OR \"QuantityAvailable\" >= 0"));
            
            // IsActive configuration with default value
            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .IsRequired();
            
            // CreatedAt configuration
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("NOW()")
                .IsRequired();
            
            // UpdatedAt configuration
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("NOW()")
                .IsRequired();
            
            // Index on Category for filtering
            entity.HasIndex(e => e.Category)
                .HasDatabaseName("IX_StoreItems_Category");
            
            // Index on IsActive for filtering active items
            entity.HasIndex(e => e.IsActive)
                .HasDatabaseName("IX_StoreItems_IsActive");
        });
        
        // Configure Order entity
        modelBuilder.Entity<Order>(entity =>
        {
            // Primary key
            entity.HasKey(e => e.Id);
            
            // PointsSpent configuration with check constraint
            entity.Property(e => e.PointsSpent)
                .IsRequired();
            
            entity.ToTable(t => t.HasCheckConstraint("CK_Order_PointsSpent", "\"PointsSpent\" > 0"));
            
            // Status configuration
            entity.Property(e => e.Status)
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("Pending");
            
            // OrderedAt configuration
            entity.Property(e => e.OrderedAt)
                .IsRequired();
            
            // Notes configuration
            entity.Property(e => e.Notes)
                .HasMaxLength(1000);
            
            // Foreign key to User
            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Foreign key to StoreItem
            entity.HasOne(e => e.StoreItem)
                .WithMany(s => s.Orders)
                .HasForeignKey(e => e.StoreItemId)
                .OnDelete(DeleteBehavior.Restrict);
            
            // Index on UserId for user order history queries
            entity.HasIndex(e => e.UserId)
                .HasDatabaseName("IX_Orders_UserId");
            
            // Index on StoreItemId for item order queries
            entity.HasIndex(e => e.StoreItemId)
                .HasDatabaseName("IX_Orders_StoreItemId");
            
            // Index on Status for filtering orders by status
            entity.HasIndex(e => e.Status)
                .HasDatabaseName("IX_Orders_Status");
            
            // Index on OrderedAt DESC for order history queries
            entity.HasIndex(e => e.OrderedAt)
                .IsDescending()
                .HasDatabaseName("IX_Orders_OrderedAt");
        });
    }
}
