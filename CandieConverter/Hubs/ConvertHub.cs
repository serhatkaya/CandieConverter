using System.Threading.Tasks;
using ElectronNET.API;
using ElectronNET.API.Entities;
using Microsoft.AspNetCore.SignalR;

namespace CandieConverter.Hubs
{
	public class ConvertHub : Hub
	{
		public async Task MessageBox(string title, string message, MessageBoxType type)
		{
			var mboxOptions = new MessageBoxOptions(message);
			mboxOptions.Title = title;
			mboxOptions.Message = message;
			mboxOptions.Type = type;
			await Electron.Dialog.ShowMessageBoxAsync(mboxOptions);
		}
	}

	public static class ConvertHubExtensions
	{
		public static Task SendFileConvertedMessageAsync(this IHubContext<ConvertHub> hubContext, string fileName)
		{
			return hubContext.Clients.All.SendAsync("fileConverted", fileName);
		}

		public static Task SendFileConvertFailedMessageAsync(this IHubContext<ConvertHub> hubContext, string fileName)
		{
			return hubContext.Clients.All.SendAsync("fileConvertFailed", fileName);
		}
	}

}