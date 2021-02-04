using System;
using AutoMapper;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using ConfigurationMiddleware.Extensions;
using System.Text.Json;
using Api.Middleware;
using Domain.Helpers;

namespace ConfigurationMiddleware
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services
                .AddCors(conf =>
                {
                    conf.AddDefaultPolicy(builder =>
                    {
                        builder
                            .WithOrigins(Configuration.GetSection("AppSettings").Get<AppSettings>().ClientAppUrl)
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                            .AllowCredentials();
                    });
                })
                .AddSwagger()
                .AddContext(Configuration)
                .AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies())
                .Configure<AppSettings>(Configuration.GetSection("AppSettings"))
                .AddDI()
                .AddControllers()
                .AddJsonOptions(conf =>
                {
                    conf.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
                    conf.JsonSerializerOptions.IgnoreNullValues = true;
                });
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app
                .UseCors()
                .UseHttpsRedirection()
                .UseRouting()
                .AddSwagger()
                .UseMiddleware<ErrorHandlerMiddleware>()
                .UseMiddleware<JwtMiddleware>()
                .UseEndpoints(endpoints =>
                {
                    endpoints.MapControllers();
                });
        }
    }
}
