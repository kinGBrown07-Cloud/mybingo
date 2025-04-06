# Bingoo - Jeu de Cartes en ligne

## Structure du Projet

### 1. Types de Jeux

- **Classic (Foods)**
  - Mise minimum : 2 points
  - 9 cartes
  - Prix jusqu'à 100 points
  - Carte gagnante : `foods-card.jpg`

- **Magic (Mode)**
  - Mise minimum : 10 points
  - 12 cartes
  - Prix jusqu'à 200 points
  - Carte gagnante : `mode-cards.jpg`

- **Gold (Jackpot)**
  - Mise minimum : 20 points
  - 16 cartes
  - Prix jusqu'à 3800 points
  - Carte gagnante : `jackpot-cards.jpg`

### 2. Logique du Jeu

1. **Objectif**
   - Trouver deux cartes identiques correspondant au thème du jeu choisi
   - Seule la carte portant le nom du thème est gagnante
   - Exemple : dans le jeu Foods, seule la carte `foods-card.jpg` est gagnante

2. **Structure des Images**
   - Dos des cartes : `/public/images/card-backs/`
     - `card-back-foods.jpg` pour Foods
     - `card-back-mode.jpg` pour Mode
     - `card-back-jackpot.jpg` pour Jackpot
   - Images des prix : `/public/images/prizes/`
     - `foods-card.jpg`
     - `mode-cards.jpg`
     - `wheel-cards.jpg`
     - `jackpot-cards.jpg`

3. **Déroulement d'une Partie**
   - Le joueur choisit un thème (Foods, Mode, Jackpot)
   - Place une mise selon le minimum requis
   - Retourne les cartes pour trouver une paire gagnante
   - Maximum 3 tentatives par partie

## Installation

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.
