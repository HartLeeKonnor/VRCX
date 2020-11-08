﻿using CefSharp;
using CefSharp.WinForms;
using System;
using System.IO;

namespace VRCX
{
    public class CefService
    {
        public static CefService Instance { get; private set; }

        static CefService()
        {
            Instance = new CefService();
        }

        internal void Init()
        {
            var cefSettings = new CefSettings
            {
                CachePath = Path.Combine(Program.BaseDirectory, "cache"),
                UserDataPath = Path.Combine(Program.BaseDirectory, "userdata"),
                IgnoreCertificateErrors = true,
                LogSeverity = LogSeverity.Disable,
                WindowlessRenderingEnabled = true,
                PersistSessionCookies = true,
                PersistUserPreferences = true
            };

            /*cefSettings.RegisterScheme(new CefCustomScheme
            {
                SchemeName = "vrcx",
                DomainName = "app",
                SchemeHandlerFactory = new FolderSchemeHandlerFactory(Application.StartupPath + "/../../../html")
            });*/

            cefSettings.CefCommandLineArgs.Add("ignore-certificate-errors");
            cefSettings.CefCommandLineArgs.Add("disable-plugins");
            cefSettings.CefCommandLineArgs.Add("disable-spell-checking");
            cefSettings.CefCommandLineArgs.Add("disable-pdf-extension");
            cefSettings.CefCommandLineArgs.Add("disable-extensions");
            // cefSettings.CefCommandLineArgs.Add("allow-universal-access-from-files");
            // cefSettings.CefCommandLineArgs.Add("disable-web-security");
            cefSettings.CefCommandLineArgs.Add("disable-gpu");
            cefSettings.CefCommandLineArgs.Add("disable-gpu-compositing");
            cefSettings.CefCommandLineArgs.Add("disable-webgl");
            cefSettings.DisableGpuAcceleration();
            cefSettings.SetOffScreenRenderingBestPerformanceArgs();

            CefSharpSettings.WcfEnabled = true; // TOOD: REMOVE THIS LINE YO
            CefSharpSettings.ShutdownOnExit = false;

            // Enable High-DPI support on Windows 7 or newer
            Cef.EnableHighDPISupport();

            if (Cef.Initialize(cefSettings) == false)
            {
                throw new Exception("Cef.Initialize()");
            }
        }

        internal void Exit()
        {
            Cef.Shutdown();
        }
    }
}