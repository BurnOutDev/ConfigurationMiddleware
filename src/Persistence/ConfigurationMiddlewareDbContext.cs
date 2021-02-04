using Domain;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace Persistence
{
    public class ConfigurationMiddlewareDbContext : DbContext
    {
        public ConfigurationMiddlewareDbContext() { }

        public ConfigurationMiddlewareDbContext(DbContextOptions<ConfigurationMiddlewareDbContext> options) : base(options)
        {
            Database.EnsureCreated();
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.ApplyConfigurationsFromAssembly(typeof(ConfigurationMiddlewareDbContext).Assembly);
        }

        public DbSet<ClientApplication> ClientApplications { get; set; }
        public DbSet<Account> Accounts { get; set; }

    }
}
