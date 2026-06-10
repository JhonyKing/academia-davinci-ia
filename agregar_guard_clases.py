# Agrega un guard de visibilidad en el <head> de las 26 clases:
# oculta la pagina de inmediato en produccion; auth.js la revela tras validar sesion.
import glob, io

GUARD = ("<head>\n<script>/*dv-guard*/if(/vercel\\.app$|academiadavinci|genioscreativos/"
         ".test(location.hostname)){document.documentElement.style.visibility='hidden';"
         "setTimeout(function(){if(!window._dvAuthOk)location.href='login.html'},9000)}</script>")

files = glob.glob(r"C:\Users\Usuario\JhonyKingAI_Remotion\clases\clase*.html")
ok, skip = [], []
for f in files:
    with io.open(f, encoding="utf-8") as fh:
        html = fh.read()
    if "dv-guard" in html:
        skip.append(f); continue
    if "<head>" not in html:
        print("SIN <head>:", f); continue
    html = html.replace("<head>", GUARD, 1)
    with io.open(f, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(html)
    ok.append(f)

print(f"Modificados: {len(ok)} | Ya tenian guard: {len(skip)}")
for f in ok: print("  +", f.split("\\")[-1])
