using CandieConverter.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Channels;
using System.Threading.Tasks;

namespace CandieConverter.Controllers
{
	public class ConvertController : Controller
	{
		private readonly ChannelWriter<ConvertModel> _channel;

		public ConvertController(ChannelWriter<ConvertModel> channel)
		{
			_channel = channel;
		}

		[HttpPost]
		public async Task<ActionResult> Convert([FromBody] List<ConvertModel> request)
		{
			try
			{
				foreach (var item in request)
				{
					await _channel.WriteAsync(item);
				}

				return Ok("Files added to queue successfully");
			}
			catch (System.Exception e)
			{
				return BadRequest(e);
			}
		}
	}
}
