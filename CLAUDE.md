@AGENTS.md

# Auth Notes Pro — Instrukcje dla Claude

## Cel projektu

Portfolio projekt na poziomie **mid Next.js developer**. Użytkownik uczy się budując — każda funkcja poprzedzona wyjaśnieniem koncepcji, napisana przez użytkownika, sprawdzona przez Claude.

## Metoda pracy (PRZESTRZEGAJ ŚCIŚLE)

1. **Claude tłumaczy / uczy** — wyjaśnia koncepcję zanim użytkownik napisze cokolwiek
2. **Użytkownik pisze** — samodzielnie, na podstawie tego co Claude wytłumaczył
3. **Claude sprawdza** — patrzy na kod użytkownika, daje feedback

**Fragmentami** — jedna koncepcja na raz. Nie piszemy całych plików od razu.
**Nie dawaj gotowego kodu** dopóki użytkownik nie napisze swojej wersji.
Cel: użytkownik musi umieć **obronić każdą linię kodu** na rozmowie rekrutacyjnej.

## Stack

| | |
|---|---|
| Framework | Next.js 16 App Router |
| Język | TypeScript |
| Styl | Tailwind CSS |
| Baza | Neon PostgreSQL |
| SQL | pakiet `postgres` (raw SQL, bez ORM) |
| Auth | własna — bcrypt + JWT + httpOnly cookies |

## Ważne — Next.js 16 breaking changes

- `params` w dynamic routes jest `Promise` → zawsze `await params`
- Turbopack jest domyślnym bundlerem (nie Webpack)
- `next build` nie uruchamia lintera automatycznie
- `middleware.ts` jest deprecated → plik nazywa się `proxy.ts`, funkcja `proxy()` (nie `middleware()`)

## Funkcjonalności do zbudowania

### Auth
- Rejestracja, logowanie, logout
- Sesja: httpOnly cookies + JWT
- Middleware — ochrona tras

### Notatki (CRUD)
- Dodaj, edytuj, usuń, lista
- Owner check — użytkownik widzi tylko swoje notatki

### Role
- `user` — swoje notatki
- `admin` — widzi wszystkie

### UX
- Loading states, obsługa błędów, puste stany
- Wyszukiwanie + filtrowanie (TanStack Query + debounce)

### Bezpieczeństwo
- Walidacja serwera (Zod)
- Owner check przy każdej operacji
- Middleware ochrony route'ów
- httpOnly cookies (nie localStorage)

### Tagowanie
- Tagi dla notatek, relacja many-to-many w SQL

### Testy
- Min. 1 test integracyjny POST /api/notes z auth

## Kontekst użytkownika

- Opanowane: React, Next.js, TypeScript, JavaScript ES6+ (poziom mid)

