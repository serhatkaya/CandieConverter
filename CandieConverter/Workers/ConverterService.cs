using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using CandieConverter.Hubs;
using CandieConverter.Models;
using ImageMagick;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace CandieConverter.Workers
{
	public class ConverterService : BackgroundService
	{
		private readonly ILogger<ConverterService> _logger;
		private readonly ChannelReader<ConvertModel> _channel;
		private readonly IHubContext<ConvertHub> _hub;

		public ConverterService(
			ILogger<ConverterService> logger, ChannelReader<ConvertModel> channel, IHubContext<ConvertHub> hub)
		{
			_logger = logger;
			_channel = channel;
			_hub = hub;
		}

		protected override async Task ExecuteAsync(CancellationToken cancellationToken)
		{
			List<Task> tasks = new List<Task>();

			await foreach (var request in _channel.ReadAllAsync(cancellationToken))
			{
				tasks.Add(Task.Run(() => Convert(request)));
			}

			while (!cancellationToken.IsCancellationRequested)
			{
				var toProcess = tasks.ToList();
				await Task.WhenAll(toProcess).ContinueWith((x) => tasks.Except(toProcess));
			}
		}

		private void Convert(ConvertModel request)
		{
			try
			{
				System.Console.WriteLine($"_converting: {request.FileName} - {DateTime.Now.ToString("HH:mm:ss")}");
				if (File.Exists(request.Path))
				{
					using (IMagickImage image = new MagickImage(request.Path))
					{
						string fileFolder = Path.GetDirectoryName(request.Path);
						string fileName = request.FileName.Split(".")[0];
						//default jpeg.
						string format = "JPEG";
						// Save frame as jpg
						switch (request.TargetFormat)
						{
							case "JPG":
								format = "JPG";
								image.Format = MagickFormat.Jpg;
								break;
							case "JPEG":
								format = "JPEG";
								image.Format = MagickFormat.Jpeg;
								break;
							case "PNG":
								format = "PNG";
								image.Format = MagickFormat.Png;
								break;
							default:
								format = "JPEG";
								image.Format = MagickFormat.Jpeg;
								break;
						}

						string fullOutputPath = Path.Combine(fileFolder, "candieOutput", $"{fileName}.{format}");
						string outputFolder = fullOutputPath.Replace(Path.GetFileName(fullOutputPath), string.Empty);

						if (!Directory.Exists(outputFolder))
						{
							Directory.CreateDirectory(outputFolder);
						}

						image.Write(fullOutputPath);
						_hub.SendFileConvertedMessageAsync(request.FileName).Wait();
					}
				}
			}
			catch (Exception e)
			{
				_hub.SendFileConvertFailedMessageAsync(request.FileName).Wait();
				_logger.LogError(e, "An unhandled exception occured");
			}
		}
	}
}