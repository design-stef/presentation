// Lanceur autonome de la présentation : un seul fichier .exe qui contient toute la présentation.
// Au lancement : il décompresse la présentation (une seule fois) dans le dossier local de l'utilisateur,
// la sert sur http://localhost et ouvre le navigateur. Fermer la fenêtre arrête la présentation.
// Compilé avec le compilateur C# fourni avec Windows (voir build/exe/compiler.ps1).
using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Reflection;
using System.Collections.Generic;

class Lanceur
{
    static readonly Dictionary<string, string> Types = new Dictionary<string, string> {
        { ".html", "text/html; charset=utf-8" }, { ".js", "text/javascript; charset=utf-8" },
        { ".mjs", "text/javascript; charset=utf-8" }, { ".css", "text/css; charset=utf-8" },
        { ".json", "application/json" }, { ".jpg", "image/jpeg" }, { ".jpeg", "image/jpeg" },
        { ".png", "image/png" }, { ".svg", "image/svg+xml" }, { ".woff2", "font/woff2" }, { ".mp4", "video/mp4" }
    };

    static int Main()
    {
        Console.Title = "Presentation Mobilier urbain";
        Console.WriteLine("Presentation Mobilier urbain - Stephane Chapelet");
        Console.WriteLine();
        string root;
        try { root = Extraire(); }
        catch (Exception e) { return Erreur("Impossible de preparer la presentation : " + e.Message); }

        HttpListener ecoute = null;
        string url = null;
        for (int port = 4173; port < 4200 && ecoute == null; port++)
        {
            var l = new HttpListener();
            l.Prefixes.Add("http://localhost:" + port + "/");
            try { l.Start(); ecoute = l; url = "http://localhost:" + port + "/"; }
            catch { l.Close(); }
        }
        if (ecoute == null) return Erreur("Aucun port libre pour lancer la presentation.");

        Console.WriteLine("Presentation prete : " + url);
        Console.WriteLine("Elle s'ouvre dans votre navigateur.");
        Console.WriteLine();
        Console.WriteLine("Clic ou fleche droite : slide suivante.  F : plein ecran.  P : mode presentateur.");
        Console.WriteLine("Laissez cette fenetre ouverte pendant la presentation ; fermez-la pour arreter.");
        try { Process.Start(url); } catch { Console.WriteLine("Ouvrez cette adresse dans votre navigateur : " + url); }

        string racine = Path.GetFullPath(root).TrimEnd('\\') + "\\";
        while (ecoute.IsListening)
        {
            HttpListenerContext ctx;
            try { ctx = ecoute.GetContext(); } catch { break; }
            var res = ctx.Response;
            try
            {
                string chemin = Uri.UnescapeDataString(ctx.Request.Url.AbsolutePath);
                if (chemin.EndsWith("/")) chemin += "index.html";
                string fichier = Path.GetFullPath(Path.Combine(racine, chemin.TrimStart('/').Replace('/', '\\')));
                if (fichier.StartsWith(racine, StringComparison.OrdinalIgnoreCase) && File.Exists(fichier))
                {
                    byte[] data = File.ReadAllBytes(fichier);
                    string type;
                    res.ContentType = Types.TryGetValue(Path.GetExtension(fichier).ToLowerInvariant(), out type) ? type : "application/octet-stream";
                    res.AddHeader("Cache-Control", "no-cache");
                    res.ContentLength64 = data.Length;
                    res.OutputStream.Write(data, 0, data.Length);
                }
                else res.StatusCode = 404;
            }
            catch { }
            finally { try { res.Close(); } catch { } }
        }
        return 0;
    }

    // Décompresse la présentation intégrée dans %LOCALAPPDATA%, une seule fois par version.
    static string Extraire()
    {
        var asm = Assembly.GetExecutingAssembly();
        using (var flux = asm.GetManifestResourceStream("presentation.zip"))
        {
            if (flux == null) throw new Exception("contenu introuvable dans le lanceur");
            string version = flux.Length.ToString() + "-" + File.GetLastWriteTimeUtc(asm.Location).Ticks.ToString();
            string dossier = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "Presentation Mobilier urbain", version);
            if (File.Exists(Path.Combine(dossier, "index.html"))) return dossier;
            Console.WriteLine("Preparation de la presentation...");
            string temp = dossier + ".tmp";
            if (Directory.Exists(temp)) Directory.Delete(temp, true);
            Directory.CreateDirectory(temp);
            using (var zip = new ZipArchive(flux, ZipArchiveMode.Read))
            {
                foreach (var e in zip.Entries)
                {
                    // les noms peuvent utiliser / ou \ selon l'outil qui a créé le zip
                    string nom = e.FullName.Replace('/', '\\');
                    string dest = Path.GetFullPath(Path.Combine(temp, nom));
                    if (!dest.StartsWith(Path.GetFullPath(temp), StringComparison.OrdinalIgnoreCase)) continue;
                    if (nom.EndsWith("\\") || e.Name.Length == 0) { Directory.CreateDirectory(dest); continue; }
                    Directory.CreateDirectory(Path.GetDirectoryName(dest));
                    using (var src = e.Open())
                    using (var outp = File.Create(dest)) src.CopyTo(outp);
                }
            }
            if (Directory.Exists(dossier)) Directory.Delete(dossier, true);
            Directory.Move(temp, dossier);
            return dossier;
        }
    }

    static int Erreur(string msg)
    {
        Console.WriteLine(msg);
        Console.WriteLine("Appuyez sur une touche pour fermer.");
        try { Console.ReadKey(); } catch { }
        return 1;
    }
}
