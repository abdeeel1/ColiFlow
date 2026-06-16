# CLAUDE.md - Guide de Développement ColiFlow (Frontend Expert)

## 🛠️ Tech Stack & Frontend Skills
- **Frontend Core:** React (Vite), JavaScript (ES6+), component-driven development.
- **UI Platform:** shadcn/ui (Radix UI primitives under the hood).
- **Styling:** Tailwind CSS v4 (Strictly use utility classes, NO heavy UI frameworks like Material Tailwind).
- **Animations:** Framer Motion (smooth transitions, hover effects, path drawing) and standard Tailwind transitions.

## 🎨 Charte Graphique & Design Tokens
Appliquer systématiquement ces couleurs dans le code Tailwind pour correspondre à la charte Figma du projet :
- **Primary/Main Color:** `#0984E3` (Bleu Électrique / Confiance) -> Utiliser des classes ou config personnalisée (`bg-[#0984E3]`, `text-[#0984E3]`).
- **Backgrounds:** Fond blanc (`bg-white`) ou gris très clair pour les sections épurées.

## 🗄️ Structure & Composants Clés
- **Rôles:** Interface dynamique avec un bouton de bascule (Toggle) pour switcher l'expérience utilisateur entre **Expéditeur (Sender)** et **Voyageur (Traveler)**.
- **Composants shadcn/ui préférés:** `Card`, `Dialog` (Modals pour les formulaires), `Button`, `Sheet` (menus latéraux), et `Badge`.
- **Requêtes API:** Utiliser impérativement `axiosClient` depuis `client/src/services/axios`.

## 🚀 Commandes de Développement
- Lancer le Front (React) : `cd client && npm run dev`
- Lancer le Back (Laravel) : `cd server && php artisan serve`
- Migrations : `php artisan migrate`

## 🎨 Directives pour les Animations (Framer Motion)
Quand tu crées ou modifies un composant :
1. Ajoute des micro-interactions fluides sur les boutons et les cartes (`whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`).
2. Utilise `<AnimatePresence>` pour les apparitions/disparitions des modals (fade-in/slide-up).
3. Reste subtil : les animations doivent servir l'expérience utilisateur (UX) de logistique, pas la ralentir.

# GSAP Animation Guidelines

## Stack
- React + Vite
- GSAP with @gsap/react

## Animation Rules
- Always use `useGSAP` from `@gsap/react` (never `useEffect` for GSAP)
- Always pass `{ scope: containerRef }` to keep selectors scoped
- Register plugins at the top of the file: `gsap.registerPlugin(ScrollTrigger)`
- Animate only `transform` and `opacity` — never `width`, `height`, `top`, `left`
- Use `gsap.context()` if not using `useGSAP`

## Common Patterns

### Entrance animation
```jsx
useGSAP(() => {
  gsap.from(".element", { opacity: 0, y: 40, duration: 0.6, ease: "power2.out" });
}, { scope: containerRef });
```

### Stagger list
```jsx
gsap.from(".item", { opacity: 0, y: 20, stagger: 0.1, ease: "power2.out" });
```

### ScrollTrigger
```jsx
gsap.from(".section", {
  scrollTrigger: { trigger: ".section", start: "top 80%" },
  opacity: 0, y: 60, duration: 0.8
});
```

## When editing animations
- Read the existing animation first before changing it
- Preserve the original timing unless asked to change it
- Never remove cleanup — useGSAP handles it automatically