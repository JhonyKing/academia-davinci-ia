---
name: feedback-memoria-github-sync
description: "Cada vez que se actualizan archivos MD de memoria local, también deben copiarse a docs/memoria-claude/ en el repo y hacer git push para mantener GitHub en sincronía"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: aa808ce1-dab7-475e-bd60-e79b73bbb60e
---

Cada vez que se escriban o actualicen archivos de memoria en `C:\Users\Usuario\.claude\projects\C--Users-Usuario-JhonyKingAI-Remotion\memory\`, también se deben copiar los cambios a `docs/memoria-claude/` dentro del repo git y hacer `git push`.

**Why:** El usuario quiere los archivos de memoria respaldados en GitHub para poder clonar el repo y no perder el contexto del proyecto.

**How to apply:** Al final de cada sesión donde se modificaron memorias, ejecutar:
```bash
cp /c/Users/Usuario/.claude/projects/C--Users-Usuario-JhonyKingAI-Remotion/memory/. /c/Users/Usuario/JhonyKingAI_Remotion/docs/memoria-claude/ -r
git add docs/memoria-claude/
git commit -m "docs: actualizar memoria Claude"
git push origin main
```
