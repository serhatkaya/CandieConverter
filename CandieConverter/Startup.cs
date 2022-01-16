using System.Collections.Generic;
using ElectronNET.API;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;

namespace CandieConverter
{
	public class Startup
	{
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices(IServiceCollection services)
		{
			services.AddMvc();
			// services.AddRazorPages();
			// services.AddControllers();
			// services.AddSwaggerGen(c =>
			// {
			//     c.SwaggerDoc("v1", new OpenApiInfo { Title = "CandieConverter", Version = "v1" });
			// });
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}
			else
			{
				app.UseExceptionHandler("/Error");
				// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
				app.UseHsts();
			}

			app.UseRouting();
			app.UseStatusCodePages();
			app.UseStaticFiles();


			app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllers();
				endpoints.MapRazorPages();
				endpoints.MapControllerRoute(
					name: "default",
					pattern: "{controller=Home}/{action=Index}/{id?}");
			});

			// Open the Electron-Window here

			if (HybridSupport.IsElectronActive)
			{
				CreateWindow();
			}
		}
		private async void CreateWindow()
		{
			var window = await Electron.WindowManager.CreateWindowAsync();
			// window.RemoveMenu();
			window.Focus();
			window.OnClosed += () =>
			{
				Electron.App.Quit();
			};
		}
	}
}
