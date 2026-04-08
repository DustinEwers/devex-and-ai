using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cheersly.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCheerEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cheers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderId = table.Column<Guid>(type: "uuid", nullable: false),
                    Message = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    PointsPerRecipient = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cheers", x => x.Id);
                    table.CheckConstraint("CK_Cheer_PointsPerRecipient", "\"PointsPerRecipient\" > 0");
                    table.ForeignKey(
                        name: "FK_Cheers_Users_SenderId",
                        column: x => x.SenderId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CheerRecipients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CheerId = table.Column<Guid>(type: "uuid", nullable: false),
                    RecipientId = table.Column<Guid>(type: "uuid", nullable: false),
                    PointsAwarded = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CheerRecipients", x => x.Id);
                    table.CheckConstraint("CK_CheerRecipient_PointsAwarded", "\"PointsAwarded\" > 0");
                    table.ForeignKey(
                        name: "FK_CheerRecipients_Cheers_CheerId",
                        column: x => x.CheerId,
                        principalTable: "Cheers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CheerRecipients_Users_RecipientId",
                        column: x => x.RecipientId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CheerRecipients_CheerId",
                table: "CheerRecipients",
                column: "CheerId");

            migrationBuilder.CreateIndex(
                name: "IX_CheerRecipients_RecipientId",
                table: "CheerRecipients",
                column: "RecipientId");

            migrationBuilder.CreateIndex(
                name: "IX_Cheers_CreatedAt",
                table: "Cheers",
                column: "CreatedAt",
                descending: new bool[0]);

            migrationBuilder.CreateIndex(
                name: "IX_Cheers_SenderId",
                table: "Cheers",
                column: "SenderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CheerRecipients");

            migrationBuilder.DropTable(
                name: "Cheers");
        }
    }
}
