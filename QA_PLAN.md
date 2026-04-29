# Plan d'Assurance Qualité - Book Review Blog YNH

## Vue d'ensemble
Plan de test complet pour les 11 issues open, avec procédures de validation, tests automatisés et checklist manuel.

---

## Issues Complétées ✅

### v0.2.0 - #35: API Error Handling
**Status**: Livré  
**Tests créés**: `e2e/api-error-handling.spec.ts`

#### Tests e2e inclus:
- ✅ Reviews page affiche erreur quand API indisponible
- ✅ Academics page affiche erreur quand API indisponible
- ✅ Bouton "Réessayer" re-charge les données après reconnexion
- ✅ Liste vide ne s'affiche pas lors d'erreur réseau
- ✅ Filtre change avec erreur API montre message d'erreur

#### Checklist QA Manuel:
- [ ] Ouvrir DevTools > Network > Disable network
- [ ] Naviguer à /reviews
- [ ] Vérifier: Message "Erreur lors du chargement..." visible
- [ ] Vérifier: Liste vide NOT visible
- [ ] Cliquer "Réessayer" -> erreur persiste
- [ ] Re-activer network, cliquer "Réessayer"
- [ ] Vérifier: Critiques chargent, erreur disparaît
- [ ] Répéter pour /academics

---

### v0.3.0 - #34: Markdown Rendering
**Status**: Livré  
**Tests créés**: `e2e/markdown-rendering.spec.ts`

#### Tests e2e inclus:
- ✅ Review detail page rend markdown comme HTML
- ✅ Academic detail page rend markdown comme HTML
- ✅ Markdown formatting (bold, italic, links) appliqué
- ✅ Whitespace et line breaks préservés
- ✅ Pas de syntaxe markdown brute visible

#### Checklist QA Manuel:
- [ ] Naviguer /reviews/1 (ou tout review avec contenu)
- [ ] Vérifier: Titres (# ## ###) rendus comme H1, H2, H3
- [ ] Vérifier: Listes (- *) rendus comme UL/LI
- [ ] Vérifier: Pas de caractères #, ##, -, * visibles
- [ ] Vérifier: Liens cliquables avec couleur accent
- [ ] Vérifier: Bold/Italic appliqué correctement
- [ ] Répéter pour /academics/1

---

### v0.4.0 - #36: Contact Link in Navigation
**Status**: Livré  
**Tests créés**: `e2e/navigation-contact-link.spec.ts`

#### Tests e2e inclus:
- ✅ Contact link visible en navigation desktop
- ✅ Contact link en bon ordre (après About, avant Admin)
- ✅ Contact link navigue à /contact
- ✅ Contact link visible en navigation mobile
- ✅ Mobile menu se ferme après clic Contact
- ✅ Styling cohérent avec autres nav links
- ✅ Hover state fonctionne
- ✅ Accessible au clavier (Tab + Enter)

#### Checklist QA Manuel:
- [ ] **Desktop** (1920x1080):
  - [ ] Naviguer à /
  - [ ] Vérifier: "Contact" visible dans la nav entre "À propos" et "Admin"
  - [ ] Cliquer "Contact" -> navigation à /contact
  - [ ] Vérifier: Hover color change sur "Contact"
- [ ] **Mobile** (375x667):
  - [ ] Naviguer à /
  - [ ] Ouvrir menu mobile (hamburger)
  - [ ] Vérifier: "Contact" visible dans le menu
  - [ ] Cliquer "Contact" -> nav à /contact
  - [ ] Vérifier: Menu se ferme après clic
- [ ] **Keyboard Navigation**:
  - [ ] Tab plusieurs fois pour atteindre "Contact"
  - [ ] Appuyer Enter -> nav à /contact

---

## Issues À Implémenter

### #37: fix(test): aria-label 401 - Tests E2E
**Priorité**: Haute  
**Type**: Bug Fix / Test  
**Effort**: Moyen

#### Description
Corriger les tests E2E 401/404 pour correspondre à l'implémentation française des aria-labels.

#### Acceptance Criteria
- [ ] Tous les tests E2E pour pages 401/404 passent
- [ ] aria-labels en français correspondent à l'UI
- [ ] Tests documentés pour QA

#### Tests e2e à créer:
```
e2e/error-pages-401-404.spec.ts
- Page 401 affiche titre, description, lien retour
- aria-label sur bouton retour correct
- Page 404 affiche titre, description, lien retour
- Navigation via lien depuis pages d'erreur
- Responsive sur mobile
- Aria-labels accessibles au lecteur d'écran
```

#### Checklist QA Manuel:
- [ ] Forcer 401 (authentication error)
  - [ ] Vérifier: Titre visible
  - [ ] Vérifier: Description visible
  - [ ] Vérifier: Lien retour cliquable
  - [ ] Vérifier: aria-labels en français
- [ ] Forcer 404 (page non-existent)
  - [ ] Vérifier: Titre visible
  - [ ] Vérifier: Description visible
  - [ ] Vérifier: Lien retour cliquable
- [ ] Tester avec screen reader (NVDA/JAWS si possible)

---

### #27: fix(a11y): Focus states visibles au clavier
**Priorité**: Haute  
**Type**: Accessibility Fix  
**Effort**: Moyen

#### Description
Assurer tous les éléments interactifs ont des focus states visibles pour la navigation au clavier.

#### Acceptance Criteria
- [ ] Navigation au clavier complètement utilisable
- [ ] Tous les liens/boutons ont focus-visible style
- [ ] Focus ring cohérent avec design system (outline/ring tailwind)
- [ ] Conforme WCAG 2.4.7 (Focus Visible)

#### Tests e2e à créer:
```
e2e/keyboard-accessibility.spec.ts
- Tous les liens de nav ont focus visible
- Tous les boutons de filtre ont focus visible
- Cartes review/academic navigables au clavier
- Formulaires (recherche, filtres) navigables
- Focus order logique sur la page
- Pas de focus trap
```

#### Checklist QA Manuel:
- [ ] Naviguer tout le site **au clavier seul** (pas de souris)
  - [ ] Home page: Tab sur tous les liens -> focus visible
  - [ ] /reviews: Tab sur filtres -> focus visible
  - [ ] Tab sur cartes -> focus visible
  - [ ] /academics: Même test
  - [ ] /admin: Tab sur tous les boutons/inputs
- [ ] **Mobile**: Swipe pour focus sur éléments
- [ ] **Lecteur d'écran**: Tester avec NVDA (Windows) ou VoiceOver (Mac)
- [ ] Focus order logique (top-to-bottom, left-to-right)

---

### #33: fix(a11y): Audit contraste WCAG
**Priorité**: Haute  
**Type**: Accessibility Fix  
**Effort**: Moyen

#### Description
Corriger les contrastes de couleur pour respecter les normes WCAG AA (ratio 4.5:1).

#### Problème identifié
`.text-muted` sur fond rose insuffisant (ratio < 4.5:1)

#### Acceptance Criteria
- [ ] Tous les textes ont contraste >= 4.5:1 (WCAG AA)
- [ ] Inclusive Color audit passe
- [ ] Aucune dégradation visuelle

#### Tests à créer:
```
e2e/wcag-color-contrast.spec.ts
- Vérifier contraste de chaque élément de texte
- Tester sur tous les thèmes de couleur
- Générer rapport de contraste
```

#### Checklist QA Manuel:
- [ ] Utiliser [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ ] Tester `.text-muted` sur `.bg-rose-200` (identifié comme problème)
  - [ ] Ratio atual vs requis 4.5:1
  - [ ] Proposer solution: plus foncé ou fond différent
- [ ] Tester tous les `.text-muted` sur fonds clairs
- [ ] Tester les liens (accent colors)
- [ ] Générer rapport et documenter changements

---

### #32: feat(ui): Améliorer la distinction du header sticky
**Priorité**: Moyenne  
**Type**: Feature / UI Enhancement  
**Effort**: Faible

#### Description
Ajouter shadow ou border pour mieux distinguer le header sticky du contenu.

#### Acceptance Criteria
- [ ] Header sticky visuellement distinct du contenu
- [ ] Shadow ou border cohérent avec design
- [ ] Pas de dégradation d'accessibilité
- [ ] Responsive sur mobile

#### Tests e2e à créer:
```
e2e/header-sticky.spec.ts
- Header reste visible au scroll
- Header a shadow/border distinction
- Header styling cohérent sur tous les breakpoints
```

#### Checklist QA Manuel:
- [ ] Desktop: Scroller la page -> header reste en haut
- [ ] Vérifier: Header a shadow distinctif
- [ ] Mobile: Même comportement
- [ ] Vérifier: Aucun contenu caché sous header

---

### #31: feat(ui): Styliser les selects dropdown (filtres)
**Priorité**: Moyenne  
**Type**: Feature / UI Enhancement  
**Effort**: Moyen

#### Description
Ajouter custom styling aux select dropdowns pour filtre genre, note, sort, etc.

#### Acceptance Criteria
- [ ] Selects stylisés cohérents avec design system
- [ ] Dropdown open/close smooth
- [ ] Accessible (keyboard + screen reader)
- [ ] Responsive sur mobile

#### Tests e2e à créer:
```
e2e/select-styling.spec.ts
- Select dropdown ouvre/ferme correctement
- Options visibles et cliquables
- Keyboard navigation (arrow keys) fonctionne
- Mobile: Dropdown accessible
- Visual regression: screenshot selects
```

#### Checklist QA Manuel:
- [ ] /reviews: Cliquer sur select "Filtrer par genre"
  - [ ] Options visibles
  - [ ] Sélectionner option -> applique filtre
  - [ ] Vérifier: Styling cohérent avec design
- [ ] /reviews: Tester "Filtrer par note"
- [ ] /academics: Tester "Filtrer par thème"
- [ ] Mobile: Tester selects sur petit écran
- [ ] Keyboard: Arrow keys ouvrent/ferment dropdown

---

### #30: feat(ui): Animations de loading - pulse effect
**Priorité**: Basse  
**Type**: Feature / UI Enhancement  
**Effort**: Faible

#### Description
Ajouter animations pulse sur skeleton loaders.

#### Acceptance Criteria
- [ ] Skeleton loaders ont pulse animation
- [ ] Animation fluide (60fps)
- [ ] Pas d'impact performance
- [ ] Respecte `prefers-reduced-motion`

#### Tests e2e à créer:
```
e2e/loading-animations.spec.ts
- Skeleton loaders visibles lors du chargement
- Animation fonctionne (pulse visible)
- Respecte prefers-reduced-motion
- Performance pas dégradée
```

#### Checklist QA Manuel:
- [ ] /reviews: Au chargement, vérifier skeletons
  - [ ] Pulse animation visible
  - [ ] Animation fluide (pas de saccades)
- [ ] Attendre que contenu charge
  - [ ] Skeletons disparaissent, contenu apparaît
- [ ] Tester prefers-reduced-motion
  - [ ] DevTools > Rendering > Prefers reduced motion
  - [ ] Vérifier: Animation arrêtée ou réduite
- [ ] /academics: Même test

---

### #29: feat(ux): Améliorer pages 401/404 avec visuels et options nav
**Priorité**: Basse  
**Type**: Feature / UX Enhancement  
**Effort**: Moyen

#### Description
Ajouter icônes, visuels, et options de navigation vers pages majeures (accueil, reviews, academics).

#### Acceptance Criteria
- [ ] Pages 401/404 ont visuels (emoji ou icône)
- [ ] Options de navigation claires (liens vers home, reviews, academics)
- [ ] Responsive sur mobile
- [ ] Accessible

#### Tests e2e à créer:
```
e2e/error-pages-enhanced.spec.ts
- Pages 401/404 chargent correctement
- Visuels visibles
- Liens de navigation présents et cliquables
- Responsive layout
```

#### Checklist QA Manuel:
- [ ] Accéder à /nonexistent -> page 404
  - [ ] Visuel (emoji) visible
  - [ ] Titre, description visibles
  - [ ] Liens de nav vers accueil, reviews, academics
  - [ ] Tous les liens cliquables
- [ ] Mobile: Layout responsive
- [ ] Accueil liens depuis 404 -> navigation fonctionne

---

### #28: feat(ui): Hover states sur les cartes (review + academic)
**Priorité**: Basse  
**Type**: Feature / UI Enhancement  
**Effort**: Faible

#### Description
Ajouter hover effects sur les cartes review et academic.

#### Acceptance Criteria
- [ ] Cartes ont hover effect (shadow, scale, color)
- [ ] Transition smooth
- [ ] Cursor change
- [ ] Pas d'impact performance

#### Tests e2e à créer:
```
e2e/card-hover-states.spec.ts
- Cartes sur /reviews
- Cartes sur /academics
- Hover effect visible (shadow, scale)
- Transition smooth
- Cursor change
```

#### Checklist QA Manuel:
- [ ] /reviews: Survoler une carte
  - [ ] Shadow augmente (depth)
  - [ ] Scale légèrement (1.01-1.02)
  - [ ] Cursor: pointer
- [ ] /academics: Même test
- [ ] Mobile: Pas de hover (tactile)
  - [ ] Tapping affiche le contenu
- [ ] Performance: Pas de lag lors du hover

---

## Plan de Test Global

### Phase 1: Tests Automatisés (e2e)
```bash
npm run e2e
```
- Tous les tests Playwright dans `e2e/`
- Couverture des critères d'acceptation
- Regression test suite

### Phase 2: Tests Manuels QA
Par breakpoint:
- **Desktop**: 1920x1080
- **Tablet**: 768x1024
- **Mobile**: 375x667, 414x896

Navigateurs:
- Chrome/Edge (Windows)
- Firefox (multi-plateforme)
- Safari (Mac)

### Phase 3: Accessibilité
- Keyboard navigation (Tab, Arrow, Enter)
- Screen reader (NVDA/JAWS ou VoiceOver)
- Color contrast (WCAG AA)
- ARIA labels

### Phase 4: Performance
- Lighthouse audit
- Build size
- Bundle analysis
- Load time

---

## Critères de Déploiement

### Pre-Release Checklist
- [ ] Tous les tests e2e passent (`npm run e2e`)
- [ ] Build sans warning (`npm run build`)
- [ ] Code review complété
- [ ] Au moins une checklist QA manuel signée

### Release Criteria
- [ ] Code merged à main
- [ ] Git tag créé (v X.Y.Z)
- [ ] GitHub Release créée avec notes
- [ ] Deployment sur serveur de test
- [ ] QA sign-off

---

## Défauts Trouvés & Résolutions

### #35 - Défaut lors du test
**Statut**: ✅ Résolu  
**Description**: API errors not propagating  
**Résolution**: Changé `catchError` de `of(empty)` à `throwError()`

### #34 - Défaut lors du test
**Statut**: ✅ Résolu  
**Description**: Markdown pas rendu, texte brut affiché  
**Résolution**: Imported `MarkdownComponent`, utilisé `<markdown [data]="content">`

### #36 - Défaut lors du test
**Statut**: ✅ Résolu  
**Description**: Contact link manquant de navigation  
**Résolution**: Ajouté lien dans desktop et mobile nav

---

## Métriques de Qualité

### Coverage Target
- Unit tests: > 80%
- e2e tests: > 95% of user flows
- Manual test coverage: 100% AC

### Performance Target
- Lighthouse: > 90
- FCP: < 2.5s
- LCP: < 2.5s
- CLS: < 0.1

### Accessibility Target
- WCAG AA: 100%
- Keyboard accessible: 100%
- Color contrast: 100%

---

## Escalation Path

Si un test échoue:
1. **e2e fail**: 
   - Vérifier si c'est un flake (rare)
   - Si reproductible: debug, fix, re-run
   - Documenter dans issue

2. **Manuel fail**:
   - Créer/mettre à jour test e2e
   - Implémenter fix
   - Re-run tous les tests

3. **Performance regression**:
   - Analyser bundle size
   - Optimiser si possible
   - Documenter trade-off

---

## Signature

**QA Plan créé**: 2026-04-29  
**Version**: 1.0  
**Responsable**: Claude Code / Rémi DA ROCHA

---

## Next Steps

1. ✅ Issues #35, #34, #36 - Implémentées et livrées
2. → Issues #37, #27, #33 - À commencer (a11y + tests)
3. → Issues #32, #31 - Features UI
4. → Issues #30, #29, #28 - Remaining features

**Estimated timeline**: 6-8 heures pour toutes les issues avec QA complète
