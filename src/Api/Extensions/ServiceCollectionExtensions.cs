using Application;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using Persistence;

namespace ConfigurationMiddleware.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddSwagger(this IServiceCollection services)
        {
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "Client Branding API",
                    Version = "v1"
                });
            });

            return services;
        }

        public static IServiceCollection AddContext(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddDbContext<ConfigurationMiddlewareDbContext>(x => x.UseInMemoryDatabase("InMemoryDatabase"));
            return services;
        }

        public static IServiceCollection AddDI(this IServiceCollection services)
        {
            services.AddScoped<IClientConfigurationService, ClientConfigurationService>();

            services.AddScoped<IAccountService, AccountService>();
            services.AddScoped<IEmailService, EmailService>();

            return services;
        }
    }
}
