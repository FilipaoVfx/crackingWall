# 🎯 Plan de Mejoras OKR - crackingWall

> Documento de optimización | Rama: Prodige | Fecha: 2026-03-30

---

## 📊 Estado Actual

| Aspecto | Estado | Prioridad |
|---------|--------|-----------|
| CI/CD | ❌ No existe | 🔴 ALTA |
| Tests | ❌ No existen | 🔴 ALTA |
| Ramas | ⚠️ 4 ramas activas | 🟡 MEDIA |
| Releases | ❌ No hay | 🟡 MEDIA |
| Protección main | ❌ No protegida | 🔴 ALTA |

---

## 🎯 OBJECTIVE 1: Infraestructura de Calidad

### KR1: GitHub Actions CI/CD
Crear `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

### KR2: ESLint + Prettier
```bash
npm install -D eslint @typescript-eslint/parser prettier
```

### KR3: Tests con Vitest
```bash
npm install -D vitest @testing-library/react
```

---

## 📋 OBJECTIVE 2: Gestión de Proyecto

### KR1: Issue Templates
Crear `.github/ISSUE_TEMPLATE/bug-report.md`

### KR2: Conventional Commits
```bash
npm install -D @commitlint/cli husky
```

### KR3: Documentación
```
docs/
├── architecture.md
├── api.md
└── deployment.md
```

---

## 🧹 OBJECTIVE 3: Limpieza

### KR1: Consolidar Ramas
- **Mantener:** main, Prodige
- **Eliminar:** mvpv1, update_worker_name_to_crackingwall

### KR2: Proteger main
```bash
gh api repos/{repo}/branches/main/protection -X PUT \
  -d '{"enforce_admins": true, "require_linear_history": false}'
```

### KR3: Crear Releases
```bash
git tag -a v1.0.0 -m "First release"
git push origin v1.0.0
```

---

## ✅ Checklist

- [ ] Crear .github/workflows/ci.yml
- [ ] Configurar ESLint + Prettier
- [ ] Añadir Vitest
- [ ] Crear issue templates
- [ ] Eliminar ramas obsoletas
- [ ] Proteger rama main
- [ ] Crear primer release v1.0.0

---

*Generado por Hermes Bot*
