using System;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace UltimateToolkitLauncher
{
	// Token: 0x02000002 RID: 2
	[ComVisible(true)]
	public class ScriptManager
	{
		// Token: 0x06000001 RID: 1 RVA: 0x00002050 File Offset: 0x00000250
		public ScriptManager(LauncherForm form)
		{
			this.form = form;
		}

		// Token: 0x06000002 RID: 2 RVA: 0x00002070 File Offset: 0x00000270
		public void LaunchV5()
		{
			this.form.Invoke(new Action(delegate()
			{
				this.form.ExecuteLaunchV5();
			}));
		}

		// Token: 0x06000003 RID: 3 RVA: 0x00002099 File Offset: 0x00000299
		public void LaunchV6()
		{
			this.form.Invoke(new Action(delegate()
			{
				this.form.ExecuteLaunchV6();
			}));
		}

		// Token: 0x06000004 RID: 4 RVA: 0x000020C2 File Offset: 0x000002C2
		public void LaunchPrinter()
		{
			this.form.Invoke(new Action(delegate()
			{
				this.form.ExecuteLaunchPrinter();
			}));
		}

		// Token: 0x06000005 RID: 5 RVA: 0x000020EB File Offset: 0x000002EB
		public void StopV6()
		{
			this.form.Invoke(new Action(delegate()
			{
				this.form.ExecuteStopV6();
			}));
		}

		// Token: 0x06000006 RID: 6 RVA: 0x00002108 File Offset: 0x00000308
		public void OpenUrl(string url)
		{
			try
			{
				Process.Start(url);
			}
			catch
			{
			}
		}

		// Token: 0x04000001 RID: 1
		private LauncherForm form;
	}
}
