using System.Threading.Channels;
using CandieConverter.Hubs;
using CandieConverter.Models;
using CandieConverter.Workers;
using ElectronNET.API;
using ElectronNET.API.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

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
			services.AddHostedService<ConverterService>();
			services.AddSingleton<Channel<ConvertModel>>(Channel.CreateUnbounded<ConvertModel>(new UnboundedChannelOptions() { SingleReader = true }));
			services.AddSingleton<ChannelReader<ConvertModel>>(svc => svc.GetRequiredService<Channel<ConvertModel>>().Reader);
			services.AddSingleton<ChannelWriter<ConvertModel>>(svc => svc.GetRequiredService<Channel<ConvertModel>>().Writer);
			services.AddSignalR();
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
				endpoints.MapHub<ConvertHub>("/convertHub");
				endpoints.MapRazorPages();
				endpoints.MapControllerRoute(
					name: "default",
					pattern: "{controller=Home}/{action=Index}/{id?}");
			});

			// Open the Electron-Window here

			if (HybridSupport.IsElectronActive)
			{
				CreateWindow(env);
			}
		}
		private async void CreateWindow(IWebHostEnvironment env)
		{
			BrowserWindowOptions options = new BrowserWindowOptions();
			WebPreferences wp = new WebPreferences();
			var window = await Electron.WindowManager.CreateWindowAsync(options);
			if (!env.IsDevelopment())
			{
				wp.DevTools = false;
				window.RemoveMenu();
			}

			window.Focus();
			window.OnClosed += () =>
			{
				Electron.App.Quit();
			};
		}
	}
}
