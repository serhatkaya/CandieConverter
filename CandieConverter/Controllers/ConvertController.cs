using CandieConverter.Models;
using ImageMagick;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using IOFile = System.IO;

namespace CandieConverter.Controllers
{
	public class ConvertController : Controller
	{
		[HttpPost]
		public async Task<ActionResult> Convert([FromBody] ConvertModel request)
		{
			if (IOFile.File.Exists(request.Path))
			{
				using (IMagickImage image = new MagickImage(request.Path))
				{
					string fileFolder = IOFile.Path.GetDirectoryName(request.Path);
					string fileName = request.FileName.Split(".")[0];
					//default jpeg.
					string format = "JPG";
					// Save frame as jpg
					switch (request.TargetFormat)
					{
						case "JPG":
							format = "JPG";
							image.Format = MagickFormat.Jpg;
							break;
						case "PNG":
							format = "PNG";
							image.Format = MagickFormat.Png;
							break;
					}

					string fullOutputPath = IOFile.Path.Combine(fileFolder, "candieOutput", $"{fileName}.{format}");
					string outputFolder = fullOutputPath.Replace(IOFile.Path.GetFileName(fullOutputPath), string.Empty);

					if (!IOFile.Directory.Exists(outputFolder))
					{
						IOFile.Directory.CreateDirectory(outputFolder);
					}

					await image.WriteAsync(fullOutputPath);
				}

				return Ok(request);
			}
			else
			{
				return BadRequest("File not found");
			}
		}
	}
}
