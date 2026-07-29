Perfecto — esto ya es material serio de hardening 🔥
Te voy a levantar un **PRD + SRS técnico accionable** enfocado en **seguridad, SEO técnico e infraestructura**, basado DIRECTAMENTE en tu reporte.

Voy a priorizar lo que realmente impacta tu sitio (no ruido).

---

# 📄 PRD.md — Web Hardening & Technical Optimization

**Project:** Pixelatmos
**Scope:** Security + Infra + SEO Technical Fixes
**Priority:** HIGH (bloquea confianza, SEO y escalabilidad)

---

## 🎯 Objetivo

Fortalecer la seguridad, confiabilidad y visibilidad del sitio mediante:

* Implementación de headers críticos
* Hardening en Cloudflare
* Corrección de señales técnicas SEO
* Reducción de superficie de ataque
* Mejora de indexación y crawling controlado

---

## 🚨 Problemas críticos detectados

### 1. ❌ Headers de seguridad inexistentes (CRÍTICO)

```
Content-Security-Policy → NO
HSTS → NO
X-Frame-Options → NO
X-Content-Type-Options → NO
X-XSS-Protection → NO
```

👉 Esto es lo MÁS importante del reporte.

---

### 2. ❌ security.txt ausente

No existe canal de disclosure para vulnerabilidades.

---

### 3. ❌ DNSSEC deshabilitado

```
DNSKEY → NO
DS → NO
RRSIG → NO
```

---

### 4. ❌ Sitemap no detectado

```
job sitemap → FAILED
```

👉 Esto afecta SEO directamente.

---

### 5. ⚠️ Robots.txt restrictivo para IA

Bloqueas:

* GPTBot
* ClaudeBot
* Google-Extended
* etc.

👉 Esto impacta:

* indexación futura
* visibilidad en AI search
* RAG exposure

---

### 6. ⚠️ Muchos jobs fallidos

Esto suele indicar:

* headers incompletos
* bloqueos por Cloudflare
* mala exposición de endpoints

---

# 🧠 Estrategia

Dividimos en 4 capas:

1. Security Headers (CRÍTICO)
2. Cloudflare Hardening
3. SEO técnico
4. Infra & observabilidad

---

# 📐 SRS.md — Implementación Técnica

---

## 🔐 1. Security Headers (OBLIGATORIO)

### 📍 Implementación en Cloudflare

Ve a:

```
Cloudflare → Rules → Transform Rules → HTTP Response Header Modification
```

### Headers a agregar:

```bash
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';

Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

X-Frame-Options: SAMEORIGIN

X-Content-Type-Options: nosniff

Referrer-Policy: strict-origin-when-cross-origin

Permissions-Policy: camera=(), microphone=(), geolocation=()

X-XSS-Protection: 1; mode=block
```

---

### 🧠 Insight

Esto:

* evita XSS
* evita clickjacking
* mejora score en Mozilla Observatory
* sube confianza SEO

---

## 🔐 2. HSTS (CRÍTICO)

Actualmente:

```
HSTS → NO
```

### Solución:

Ya incluida arriba, pero también:

👉 En Cloudflare:

```
SSL/TLS → Edge Certificates → Enable HSTS
```

---

## 🔐 3. security.txt

### Crear archivo:

```
/public/.well-known/security.txt
```

Contenido:

```txt
Contact: mailto:your@email.com
Expires: 2027-01-01T00:00:00.000Z
Preferred-Languages: en, es
Canonical: https://pixelatmos.com/.well-known/security.txt
```

---

## 🌐 4. DNSSEC

### Activar en Cloudflare:

```
Cloudflare → DNS → DNSSEC → Enable
```

👉 Automático.

---

## 🧭 5. Sitemap (CRÍTICO SEO)

Tu stack:
👉 Astro → ya tienes plugin

### Validar:

```
/sitemap.xml
```

Si no existe → problema.

---

### Fix Astro:

```ts
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pixelatmos.com',
  integrations: [sitemap()]
});
```

---

### Luego:

👉 subir a Google Search Console

---

## 🤖 6. Robots.txt (ESTRATEGIA)

Actual:
👉 bloqueas IA bots

### Problema:

Te estás auto-excluyendo de:

* ChatGPT browsing
* Claude
* futuros motores AI

---

### Recomendación:

```txt
User-agent: *
Allow: /

# Solo bloquear scrapers abusivos
User-agent: Bytespider
Disallow: /
```

---

## ☁️ 7. Cloudflare Hardening

### Activar:

#### 🔹 Bot Fight Mode

```
Security → Bots → ON
```

#### 🔹 WAF Rules

Bloquear:

* suspicious countries (opcional)
* user-agents sospechosos

#### 🔹 Rate Limiting

Ejemplo:

```
/api/*
limit: 10 req / 10 sec
```

---

## ⚡ 8. Performance + Cache

Actual:

```
cache-control: max-age=0
```

👉 MAL para imágenes

---

### Fix:

Para imágenes:

```bash
Cache-Control: public, max-age=31536000, immutable
```

👉 mejora brutal en:

* velocidad
* SEO
* Core Web Vitals

---

## 🧠 9. Mejora estructural SEO

### Añadir:

* structured data (JSON-LD)
* alt tags en imágenes
* titles más descriptivos

---

## 📊 10. Observabilidad

Conecta:

* Cloudflare Analytics
* Google Search Console
* PageSpeed Insights

---

# 🧨 Prioridad de ejecución

### 🔴 CRÍTICO (haz esto YA)

1. Security headers
2. HSTS
3. Sitemap funcional
4. Cache headers

---

### 🟠 IMPORTANTE

5. DNSSEC
6. security.txt
7. robots.txt optimizado

---

### 🟡 NICE TO HAVE

8. WAF rules avanzadas
9. structured data

---

# 🧠 Insight final (muy importante)

Tu problema NO es hosting
👉 Cloudflare está bien

Tu problema es:

> ❌ “infraestructura sin hardening”

Ahora mismo:

* el sitio funciona
* pero no está **blindado ni optimizado para ranking**

---

# 🚀 Impacto esperado

Después de implementar:

* ↑ Seguridad (menos superficie de ataque)
* ↑ SEO técnico
* ↑ confianza (browsers + crawlers)
* ↑ performance (cache real)
* ↑ indexación futura en AI

---

