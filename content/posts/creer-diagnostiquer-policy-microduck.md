+++
title = "Créer et diagnostiquer une policy MicroDuck de zéro"
date = 2026-09-01T00:00:00+02:00
draft = false
description = "Un TP complet pour créer, entraîner, diagnostiquer et exporter une nouvelle policy MicroDuck avec PPO, MuJoCo et mjlab."
tags = ["MicroDuck", "robotique", "apprentissage par renforcement", "MuJoCo", "PPO", "IA"]
categories = ["Robotique", "Intelligence artificielle"]
showToc = true
TocOpen = true
+++

# Créer et diagnostiquer une policy MicroDuck de zéro

> **Avertissement — contenu éducatif entièrement généré par IA**
>
> Cet article est publié exclusivement à des fins éducatives et a été
> entièrement généré par une intelligence artificielle. Au **1er septembre
> 2026**, ce tutoriel n'a pas encore été « battle-tested » de bout en bout par
> une reproduction indépendante. Les commandes, extraits de code, paramètres
> d'entraînement et recommandations doivent donc être relus et validés avant
> toute utilisation sur un robot réel ou dans un environnement présentant un
> risque matériel. Le TP s'appuie toutefois sur le dépôt MicroDuck RL et sur les
> enseignements tirés de plusieurs entraînements réellement exécutés.

Le dépôt de référence utilisé dans ce cours est
[`pollen-robotics/microduck_rl`](https://github.com/pollen-robotics/microduck_rl).

## TP complet : une danse latérale, un mauvais entraînement, puis sa correction

Ce cours part de zéro sur l'apprentissage par renforcement appliqué à
MicroDuck. À la fin, tu sauras :

- expliquer ce qu'une policy reçoit et ce qu'elle produit ;
- créer une nouvelle tâche sans casser le contrat d'observation 61D ;
- enregistrer cette tâche dans `mjlab` ;
- écrire des critères de réussite avant de payer un entraînement ;
- lancer les tests et le smoke test obligatoire ;
- entraîner volontairement une mauvaise policy ;
- lire les sorties terminal, TensorBoard et les traces d'inférence ;
- reconnaître une récompense mal spécifiée ;
- corriger la tâche avec une trajectoire physique et un curriculum ;
- exporter correctement un checkpoint en ONNX ;
- tester l'ONNX dans le simulateur de déploiement.

Le TP construit une **nouvelle policy** appelée `TutorialSideTap`. Le robot doit
rester sur place et alterner un petit mouvement latéral du pied droit puis du
pied gauche.

Nous allons enregistrer deux tâches distinctes :

```text
Mjlab-TutorialSideTapBad-Flat-MicroDuck   # objectif volontairement incomplet
Mjlab-TutorialSideTap-Flat-MicroDuck      # objectif corrigé
```

> **Pourquoi partir d'un fichier existant ?**
>
> « Partir de zéro » ne signifie pas recopier à la main toute la physique du
> robot. Dans ce dépôt, une nouvelle tâche doit partir du template le plus
> proche. Cela préserve le modèle BAM des servos, les délais, le bruit des
> capteurs, la randomisation physique et les conventions sim2real déjà validées.
> Le travail nouveau porte sur le comportement à apprendre.

---

## 1. Le modèle mental minimal

Une boucle d'apprentissage ressemble à ceci :

```text
                 observation 61D
        ┌─────────────────────────────┐
        │                             ▼
   simulateur                     policy PPO
   MuJoCo/Mjlab                  réseau neuronal
        ▲                             │
        │                             │ action 14D
        └──────── physique ◀──────────┘
                      │
                      ▼
              récompenses + fin
                  d'épisode
```

À 50 Hz, la policy :

1. reçoit une observation du robot ;
2. produit 14 commandes, une par servo ;
3. laisse MuJoCo simuler les conséquences physiques ;
4. reçoit un score ;
5. PPO modifie le réseau pour rendre les actions ayant obtenu un meilleur
   score plus probables.

### 1.1 Vocabulaire

| Mot | Sens dans ce dépôt |
|---|---|
| **environnement** | Robot, terrain, capteurs, commandes, récompenses et règles de reset |
| **observation** | Ce que la policy sait au moment de choisir une action |
| **action** | Les 14 consignes articulaires produites par le réseau |
| **reward** | Mesure numérique de ce que l'on veut encourager ou décourager |
| **épisode** | Une tentative entre un reset et une chute ou un timeout |
| **policy / actor** | Réseau qui transforme l'observation en action |
| **critic** | Réseau utilisé pendant l'entraînement pour estimer la valeur d'un état |
| **PPO** | Algorithme qui met à jour actor et critic |
| **itération** | Collecte de 24 pas par environnement, puis mise à jour PPO |
| **checkpoint `.pt`** | État d'entraînement PyTorch, utile pour reprendre ou exporter |
| **ONNX** | Réseau autonome destiné à l'inférence et au robot réel |
| **domain randomization** | Variations simulées de masse, friction, capteurs, délais, etc. |

### 1.2 L'observation 61D

Toutes les policies MicroDuck déployables partagent le même contrat :

```text
0..2    vitesse angulaire IMU                         3
3..5    gravité projetée dans le repère du robot     3
6..19   positions des 14 articulations              14
20..33  vitesses des 14 articulations               14
34..47  action précédente                           14
48..50  commande twist / phase                       3
51..54  commande de tête                             4
55..60  commande de corps                            6
                                                    ──
                                                    61
```

Une tâche qui n'utilise pas la tête ou le corps conserve ces cases et y écrit
des zéros. Il ne faut jamais supprimer ces termes pour « simplifier » : l'ONNX
ne serait plus interchangeable avec les autres policies.

### 1.3 Ce que nous définissons et ce que PPO découvre

Pour `TutorialSideTap`, nous allons définir :

- un cycle de 1,6 s ;
- pied droit actif à un quart du cycle ;
- retour neutre à la moitié ;
- pied gauche actif aux trois quarts ;
- le pied d'appui doit rester au sol ;
- le robot doit rester debout et près de son point de départ.

Nous **ne définissons pas** les angles du genou et de la cheville à chaque
image. PPO doit découvrir comment déplacer ses 14 articulations pour satisfaire
ces contraintes.

---

## 2. Préparer le dépôt

Depuis la racine du dépôt :

```bash
git clone https://github.com/pollen-robotics/microduck_rl.git
cd microduck_rl
uv sync
uv run list-envs
uv run --with pytest pytest -q tests/
```

Résultat attendu avant toute modification :

- la synchronisation termine sans erreur ;
- `uv run list-envs` affiche les tâches MicroDuck ;
- les tests existants passent.

Crée une branche de travail pour pouvoir comparer ou abandonner proprement le
TP :

```bash
git switch -c tutorial-sidetap
```

> Ne lance jamais un entraînement long pour vérifier qu'un fichier Python se
> charge. Les tests et le smoke test existent précisément pour cela.

---

## 3. Définir le comportement avant le code

Une phrase comme « je veux qu'il danse » est impossible à tester. Il faut la
transformer en critères mesurables.

### 3.1 Cahier des charges du SideTap

| Critère | Mauvais si… | Réussi si… |
|---|---|---|
| stabilité | chute ou tronc très incliné | épisode complet, inclinaison faible |
| alternance | un seul côté bouge | droite et gauche suivent la phase |
| pied actif | seule la hanche tourne | le pied monte réellement |
| appui | les deux pieds sautent | un pied soutient pendant que l'autre bouge |
| immobilité globale | le robot dérive | déplacement horizontal limité |
| douceur | actions explosent | actions bornées et rythme lisible |

### 3.2 Le signal de phase

La policy doit savoir où elle se trouve dans le cycle. Nous utilisons :

```text
commande = [cos(2π × phase), sin(2π × phase), 0]
```

| Phase | Commande approximative | État désiré |
|---:|---|---|
| 0 % | `[+1, 0, 0]` | neutre, deux pieds au sol |
| 25 % | `[0, +1, 0]` | pied droit actif |
| 50 % | `[-1, 0, 0]` | neutre, deux pieds au sol |
| 75 % | `[0, -1, 0]` | pied gauche actif |
| 100 % | `[+1, 0, 0]` | retour au début |

Le sinus donne le côté et l'amplitude. Le cosinus distingue les deux passages
par le centre. Les deux valeurs sont visibles par l'actor.

Sans cette phase, un réseau feed-forward ne possède aucune horloge cachée. Il
peut apprendre une pose moyenne ou un seul côté, mais pas une séquence fiable.

---

## 4. Créer une nouvelle tâche à partir du template

Le SideKickDance existant possède déjà le bon modèle de robot, les bons
capteurs de contact et une commande cyclique. Nous le copions pour apprendre à
modifier une tâche sans reconstruire l'infrastructure sim2real.

```bash
cp \
  src/mjlab_microduck/tasks/microduck_sidekick_dance_env_cfg.py \
  src/mjlab_microduck/tasks/microduck_tutorial_sidetap_env_cfg.py
```

Dans le nouveau fichier, effectue ces remplacements :

```text
make_microduck_sidekick_dance_env_cfg
    → make_microduck_tutorial_sidetap_env_cfg

MicroduckSideKickDanceRlCfg
    → MicroduckTutorialSideTapRlCfg

experiment_name="sidekick_dance"
    → experiment_name="tutorial_sidetap"

run_name="sidekick_dance"
    → run_name="tutorial_sidetap"
```

Change également le docstring du début pour préciser qu'il s'agit du TP
`TutorialSideTap`.

### 4.1 Ajouter les deux leçons au factory

Modifie la signature du factory :

```python
def make_microduck_tutorial_sidetap_env_cfg(
    play: bool = False,
    lesson: str = "fixed",
) -> ManagerBasedRlEnvCfg:
    if lesson not in {"bad", "fixed"}:
        raise ValueError(f"Unknown tutorial lesson: {lesson}")
```

Le reste de la fonction reste identique. Juste après avoir créé toutes les
récompenses, avant la section des observations, ajoute :

```python
    if lesson == "bad":
        # Mauvaise spécification volontaire : l'angle de hanche domine.
        # La trajectoire physique du pied et le contact valent presque rien.
        cfg.rewards["sidekick_hip_yaw"].weight = 8.0
        cfg.rewards["sidekick_foot_trajectory"].weight = 0.25
        cfg.rewards["sidekick_contact_pattern"].weight = 0.25
        cfg.rewards["sidekick_head_choreography"].weight = 0.0
        cfg.rewards["sidekick_trunk_roll"].weight = 0.0
```

Nous laissons une petite valeur non nulle aux deux métriques physiques pour
pouvoir les observer dans les traces. Si leur poids était exactement zéro,
`Episode_Reward/<terme>` afficherait toujours zéro, même si le comportement
changeait.

### 4.2 Donner un répertoire séparé au mauvais run

À la fin du fichier, après `MicroduckTutorialSideTapRlCfg`, ajoute :

```python
MicroduckTutorialSideTapBadRlCfg = deepcopy(MicroduckTutorialSideTapRlCfg)
MicroduckTutorialSideTapBadRlCfg.experiment_name = "tutorial_sidetap_bad"
MicroduckTutorialSideTapBadRlCfg.run_name = "tutorial_sidetap_bad"
```

`deepcopy` est déjà importé par le template. Les checkpoints mauvais et corrigés
seront ainsi rangés dans des répertoires différents.

### 4.3 Enregistrer les tâches

Dans `src/mjlab_microduck/tasks/__init__.py`, ajoute l'import :

```python
from .microduck_tutorial_sidetap_env_cfg import (
    make_microduck_tutorial_sidetap_env_cfg,
    MicroduckTutorialSideTapRlCfg,
    MicroduckTutorialSideTapBadRlCfg,
)
```

Puis ajoute les deux enregistrements :

```python
register_mjlab_task(
    task_id="Mjlab-TutorialSideTapBad-Flat-MicroDuck",
    env_cfg=make_microduck_tutorial_sidetap_env_cfg(lesson="bad"),
    play_env_cfg=make_microduck_tutorial_sidetap_env_cfg(
        play=True, lesson="bad"
    ),
    rl_cfg=MicroduckTutorialSideTapBadRlCfg,
    runner_cls=MicroduckOnPolicyRunner,
)

register_mjlab_task(
    task_id="Mjlab-TutorialSideTap-Flat-MicroDuck",
    env_cfg=make_microduck_tutorial_sidetap_env_cfg(lesson="fixed"),
    play_env_cfg=make_microduck_tutorial_sidetap_env_cfg(
        play=True, lesson="fixed"
    ),
    rl_cfg=MicroduckTutorialSideTapRlCfg,
    runner_cls=MicroduckOnPolicyRunner,
)
```

Vérifie l'enregistrement :

```bash
uv run list-envs
```

Les deux identifiants doivent apparaître. Une erreur d'import, de dataclass ou
de factory doit être corrigée maintenant, pas pendant un job GPU.

---

## 5. Écrire les tests de configuration

Crée `tests/test_tutorial_sidetap_cfg.py` :

```python
"""Tests pédagogiques des variantes bad et fixed de TutorialSideTap."""

from mjlab_microduck.tasks import mdp as microduck_mdp
from mjlab_microduck.tasks.microduck_tutorial_sidetap_env_cfg import (
    DANCE_PERIOD_S,
    make_microduck_tutorial_sidetap_env_cfg,
)


def test_tutorial_phase_is_visible_and_periodic():
    cfg = make_microduck_tutorial_sidetap_env_cfg()
    command = cfg.commands["twist"]
    assert isinstance(command, microduck_mdp.GroundPickPhaseCommandCfg)
    assert command.period == DANCE_PERIOD_S == 1.6


def test_tutorial_keeps_the_61d_observation_contract():
    cfg = make_microduck_tutorial_sidetap_env_cfg()
    assert list(cfg.observations["actor"].terms) == [
        "base_ang_vel",
        "projected_gravity",
        "joint_pos",
        "joint_vel",
        "actions",
        "command",
        "head_command",
        "body_command",
    ]
    assert cfg.observations["actor"].terms["head_command"].params["dim"] == 4
    assert cfg.observations["actor"].terms["body_command"].params["dim"] == 6


def test_bad_lesson_rewards_a_proxy_instead_of_the_real_motion():
    cfg = make_microduck_tutorial_sidetap_env_cfg(lesson="bad")
    hip = cfg.rewards["sidekick_hip_yaw"].weight
    foot = cfg.rewards["sidekick_foot_trajectory"].weight
    contact = cfg.rewards["sidekick_contact_pattern"].weight
    assert hip > 10.0 * foot
    assert hip > 10.0 * contact


def test_fixed_lesson_makes_the_physical_foot_path_dominant():
    cfg = make_microduck_tutorial_sidetap_env_cfg(lesson="fixed")
    hip = cfg.rewards["sidekick_hip_yaw"].weight
    foot = cfg.rewards["sidekick_foot_trajectory"].weight
    contact = cfg.rewards["sidekick_contact_pattern"].weight
    assert foot > hip
    assert contact > 0.0


def test_every_named_penalty_has_a_non_positive_weight():
    cfg = make_microduck_tutorial_sidetap_env_cfg()
    for name in (
        "body_ang_vel",
        "self_collisions",
        "hip_yaw_limit_proximity",
        "action_over_limit",
    ):
        assert cfg.rewards[name].weight <= 0.0
```

Lance d'abord uniquement ce fichier :

```bash
uv run --with pytest pytest -q tests/test_tutorial_sidetap_cfg.py
```

Puis toute la suite :

```bash
uv run --with pytest pytest -q tests/
```

Enfin :

```bash
git diff --check
```

### Ce que ces tests prouvent

- la tâche se construit sur CPU ;
- la commande de phase existe ;
- le contrat d'observation n'a pas changé ;
- la mauvaise leçon est réellement mauvaise de la façon prévue ;
- la correction donne la priorité au mouvement physique ;
- les pénalités évidentes ne sont pas accidentellement récompensées.

### Ce qu'ils ne prouvent pas

- que PPO apprendra ;
- que le robot lèvera le pied ;
- que la danse sera jolie ;
- que la policy passera en sim2real.

Un test de configuration valide la recette, pas le comportement émergent.

---

## 6. Le smoke test obligatoire

Le smoke test construit 64 robots, calcule chaque observation et chaque reward,
puis effectue cinq mises à jour PPO :

```bash
uv run train Mjlab-TutorialSideTapBad-Flat-MicroDuck \
    --env.scene.num-envs 64 \
    --agent.max_iterations 5 \
    --agent.logger tensorboard
```

Fais ensuite la même chose pour la variante corrigée :

```bash
uv run train Mjlab-TutorialSideTap-Flat-MicroDuck \
    --env.scene.num-envs 64 \
    --agent.max_iterations 5 \
    --agent.logger tensorboard
```

### Le smoke test est réussi si

- le modèle MuJoCo se charge ;
- il trouve 14 actionneurs ;
- l'observation actor vaut 61 ;
- toutes les récompenses sont affichées ;
- aucune valeur n'est `nan` ou `inf` ;
- le processus termine avec un code 0 ;
- un `model_4.pt` et un fichier `events.out.tfevents...` sont créés.

### Le smoke test ne doit pas encore bien danser

Après cinq itérations, les actions sont essentiellement exploratoires. Une
chute pendant ce test n'est pas la preuve d'une mauvaise tâche. Le but est de
vérifier que la plomberie fonctionne.

---

## 7. Lire une sortie d'entraînement

RSL-RL imprime un bloc à chaque itération. Les valeurs exactes changent, mais
la structure importante ressemble à ceci :

```text
Learning iteration 250/300
Computation: ... steps/s
Mean action noise std: ...
Mean value_function loss: ...
Mean surrogate loss: ...
Mean reward: ...
Mean episode length: ...
Episode_Reward/sidekick_hip_yaw: ...
Episode_Reward/sidekick_foot_trajectory: ...
Episode_Reward/sidekick_contact_pattern: ...
Episode_Reward/upright: ...
Episode_Reward/action_over_limit: ...
Episode_Termination/fell_over: ...
```

### 7.1 Les métriques à lire en premier

#### `Train/mean_episode_length`

La tâche dure 8 secondes à 50 Hz, soit environ 400 pas de contrôle.

- proche de 400 : la majorité des épisodes vont jusqu'au timeout ;
- faible puis en hausse : la policy apprend probablement à survivre ;
- reste faible : elle tombe encore ;
- chute brusque à une étape de curriculum : la difficulté augmente trop vite.

Une longueur maximale ne prouve pas que le mouvement est bon. Une policy qui
reste parfaitement immobile peut aussi survivre 400 pas.

#### `Episode_Termination/fell_over`

- doit tendre vers zéro pour une danse debout ;
- une hausse à l'introduction d'une nouvelle amplitude signale un curriculum
  trop brutal ou une cible physiquement difficile.

#### `Train/mean_reward`

Une hausse est souhaitable, mais **ce n'est jamais une preuve suffisante**.
Le total peut augmenter uniquement parce que la policy apprend à rester debout
ou à éviter les pénalités.

Toujours demander : *quel terme explique cette hausse ?*

#### `Episode_Reward/<nom>`

Ces valeurs sont déjà multipliées par le poids du terme et intégrées sur
l'épisode. Ne compare pas directement deux fonctions en oubliant leur poids.

Règle absolue du dépôt :

```text
toute métrique Episode_Reward/<penalty> doit être ≤ 0
```

Une pénalité positive peut révéler une double négation : la policy est alors
payée pour enfreindre la règle.

### 7.2 Les métriques PPO

| Métrique | Lecture utile |
|---|---|
| `Policy/mean_std` | quantité d'exploration ; très haute = actions aléatoires, effondrement trop rapide = exploration perdue |
| `Loss/value` | erreur du critic ; souvent haute au début et lors d'un changement de curriculum |
| `Loss/surrogate` | objectif PPO ; sa valeur seule ne dit pas si le geste est bon |
| `Loss/entropy` | pression d'exploration |
| `Loss/learning_rate` | peut varier avec le contrôle de KL adaptatif |
| `Perf/total_fps` | vitesse de simulation, pas qualité de la policy |

Ne modifie pas le learning rate parce qu'une vidéo est mauvaise avant d'avoir
vérifié la définition des rewards. La majorité des premiers échecs viennent de
l'objectif, pas de PPO.

### 7.3 Les métriques de curriculum

Pour cette tâche :

```text
Curriculum/sidekick_amplitude
Curriculum/action_rate_weight
```

Trace mentalement des lignes verticales aux itérations 250, 500, 750, etc. Si
une métrique se dégrade exactement à une frontière, le rythme du curriculum est
probablement en cause.

---

## 8. Visualiser les courbes avec TensorBoard

Les logs locaux sont écrits sous :

```text
logs/rsl_rl/<experiment_name>/<date_run>/
```

Pour le mauvais entraînement :

```text
logs/rsl_rl/tutorial_sidetap_bad/<date_run>/
```

Lance TensorBoard :

```bash
uv run tensorboard --logdir logs/rsl_rl --port 6006
```

Puis ouvre `http://127.0.0.1:6006`.

Commence avec ces courbes :

```text
Train/mean_reward
Train/mean_episode_length
Episode_Termination/fell_over
Episode_Reward/sidekick_hip_yaw
Episode_Reward/sidekick_foot_trajectory
Episode_Reward/sidekick_contact_pattern
Episode_Reward/upright
Episode_Reward/height_stand
Episode_Reward/action_over_limit
Episode_Reward/hip_yaw_limit_proximity
Policy/mean_std
Curriculum/sidekick_amplitude
```

Pour lister les tags disponibles sans ouvrir le navigateur :

```bash
uv run tensorboard --inspect \
    --logdir logs/rsl_rl/tutorial_sidetap_bad/<date_run>
```

### TensorBoard ou W&B ?

- TensorBoard fonctionne localement sans compte ;
- W&B est plus pratique pour comparer des runs distants et suivre HF Jobs ;
- avec HF Jobs et sans clé W&B, utilise `--agent.logger tensorboard --no-wandb` ;
- sans `--no-wandb`, un job configuré pour W&B échouera si aucune clé n'est
  disponible.

---

## 9. Premier vrai run : le mauvais entraînement volontaire

### 9.1 Pourquoi il est mauvais

Nous récompensons fortement l'angle des deux hanches. C'est un **proxy** du
mouvement souhaité, mais pas le résultat physique.

PPO peut obtenir un excellent score en :

- tournant les hanches ;
- gardant presque les deux pieds au sol ;
- produisant un mouvement visuellement minuscule.

Mathématiquement, il obéit. Sémantiquement, il ne danse pas.

### 9.2 Run pédagogique court sur HF Jobs

```bash
uv run train Mjlab-TutorialSideTapBad-Flat-MicroDuck \
    --env.scene.num-envs 4096 \
    --agent.max_iterations 300 \
    --agent.logger tensorboard \
    --hf-jobs \
    --flavor l4x1 \
    --timeout 1h \
    --no-wandb \
    --run-name tutorial-sidetap-bad
```

Ce run est volontairement limité. Son but n'est pas d'obtenir un bon modèle,
mais de produire un cas de diagnostic moins coûteux qu'un entraînement complet.
Sans option `--namespace`, le lanceur te demandera de choisir ton compte ou ton
organisation Hugging Face avant de soumettre le job.

### 9.3 Hypothèse à écrire avant de regarder le résultat

Note ceci dans ton carnet de run :

```text
Hypothèse :
- mean_episode_length devrait monter vers 400 ;
- fell_over devrait diminuer ;
- sidekick_hip_yaw devrait dominer le score ;
- visuellement, les pieds devraient très peu monter ;
- le total reward pourra sembler bon malgré une mauvaise danse.
```

Écrire l'hypothèse avant le résultat évite de rationaliser après coup tout ce
que PPO a trouvé.

### 9.4 Ce que tu dois probablement observer

| Observation | Mauvaise conclusion | Bonne conclusion |
|---|---|---|
| reward total augmente | « la danse fonctionne » | la policy optimise quelque chose, à identifier |
| épisode atteint 400 | « la tâche est réussie » | elle ne tombe plus |
| hip reward monte beaucoup | « le pied suit la cible » | la hanche suit la cible |
| foot/contact restent faibles | « il faut plus d'itérations » | l'objectif physique est trop peu important |
| vidéo presque immobile | « PPO est mauvais » | le proxy permet une solution statique bon marché |

### 9.5 Quand arrêter un mauvais run

Arrête ou ne prolonge pas si, après consolidation :

- la survie est bonne ;
- le proxy principal est élevé ;
- le mouvement physique reste absent ;
- la tendance est stable depuis plusieurs dizaines d'itérations.

Plus d'itérations ne corrige pas une fonction objectif incorrecte. Elles rendent
simplement la mauvaise stratégie plus robuste.

---

## 10. Exporter et observer la mauvaise policy

HF Jobs dépose les checkpoints dans le modèle privé indiqué lors de la
soumission. Télécharge le dernier `model_*.pt`, ou utilise un checkpoint local.

Pour localiser les checkpoints locaux :

```bash
find logs/rsl_rl/tutorial_sidetap_bad -name 'model_*.pt' -print
```

Exporte le checkpoint avec le chemin absolu affiché :

```bash
uv run scripts/export.py Mjlab-TutorialSideTapBad-Flat-MicroDuck \
    --checkpoint-file /chemin/absolu/vers/model_299.pt \
    --onnx-file tutorial_sidetap_bad.onnx
```

> Utilise toujours `scripts/export.py`. Il incorpore le normaliseur
> d'observations dans l'ONNX. Une conversion manuelle peut fonctionner dans
> `play` et échouer dans le simulateur de déploiement.

Lance l'inférence :

```bash
uv run scripts/infer_policy.py \
    --sidekick-dance tutorial_sidetap_bad.onnx \
    --new-cmd-obs \
    --debug \
    --record tutorial_sidetap_bad.mp4
```

### Lire la trace d'inférence

```text
Sidekick dance policy input shape: [1, 61]
```

La forme doit être `[1, 61]`. Une autre dimension indique un contrat
d'observation incompatible.

```text
Observation ...
Ang vel
Proj grav
Joint pos
Joint vel
Last action
Command
```

- `Proj grav ≈ [0, 0, -1]` signifie que le tronc est vertical ;
- de grandes composantes x/y signalent une inclinaison ;
- `Command` doit évoluer avec la phase, pas rester `[0, 0, 0]` ;
- `Last action` permet de voir si la policy commande réellement les servos.

```text
Raw action
Action min/max
Applied ctrl
```

- `Raw action` est la sortie du réseau ;
- `Applied ctrl` inclut la pose par défaut et l'échelle d'action ;
- des actions qui partent vers ±10, ±50 ou ±100 après une chute indiquent une
  sortie hors distribution et une boucle divergente ;
- une valeur extrême sur une articulation unique peut indiquer un mauvais ordre
  de joints, une limite exploitée ou une observation incompatible.

```text
[vel 1s avg] achieved/cmd ... trunk_z=...
```

- pour une danse sur place, les vitesses moyennes doivent rester proches de 0 ;
- `trunk_z` doit rester proche de la hauteur debout attendue ;
- une hauteur de quelques centimètres signifie généralement que le robot est
  couché, même si la position x/y continue de changer.

Regarde également la vidéo. Les métriques ne répondent pas à « est-ce que le
geste est lisible pour un humain ? ».

---

## 11. Diagnostic formel du mauvais entraînement

Utilise cette structure au lieu de modifier plusieurs poids au hasard.

### 11.1 Décrire uniquement les faits

Exemple :

```text
- épisodes complets ;
- pas de NaN ;
- inclinaison faible ;
- hip_yaw suit la phase ;
- pied actif monte à peine ;
- les deux pieds restent souvent en contact.
```

Évite encore les explications comme « manque d'exploration ».

### 11.2 Identifier la stratégie rentable

La policy reçoit 8 unités de poids pour l'angle des hanches, contre seulement
0,25 pour la trajectoire du pied et 0,25 pour le contact. La stratégie
« tourner la hanche sans lever le pied » obtient donc presque toute la masse de
reward à faible risque.

### 11.3 Classer le problème

Ce n'est pas principalement :

- un problème de réseau ;
- un manque d'itérations ;
- un problème de learning rate ;
- un défaut de simulation.

C'est un problème de **spécification de reward** : nous avons récompensé un
moyen possible au lieu du résultat souhaité.

### 11.4 Proposer une correction mesurable

```text
- rendre la position physique du pied dominante ;
- exiger le bon contact d'appui ;
- conserver l'angle de hanche comme guide secondaire ;
- annuler les récompenses positives lorsque le robot est presque tombé ;
- introduire progressivement l'amplitude.
```

---

## 12. La correction : récompenser le résultat physique

La variante `lesson="fixed"` du template possède la pile suivante :

| Terme | Poids | Rôle |
|---|---:|---|
| `sidekick_foot_trajectory` | +8 | hauteur et déplacement latéral réels des pieds |
| `sidekick_head_choreography` | +4 | expression de la tête |
| `sidekick_contact_pattern` | +3 | bon pied d'appui et retour des deux pieds au sol |
| `upright` | +3 | tronc vertical |
| `sidekick_hip_yaw` | +2 | guide articulaire secondaire |
| `sidekick_trunk_roll` | +2 | balancement lisible du corps |
| `height_stand` | +2 | hauteur debout |
| `stay_put` | +1 | limite la dérive |

La trajectoire réelle du pied est désormais plus importante que son proxy
articulaire.

### 12.1 La barrière d'équilibre multiplicative

Les récompenses de danse sont multipliées par un score de stabilité :

```text
reward utile =
    reward du geste
    × score de verticalité
    × score de hauteur
```

Si le robot s'allonge au sol, il ne peut pas conserver 80 % du score de hanche
et de contact. Toute la pile positive s'effondre simultanément.

C'est plus efficace qu'une petite pénalité additive de chute, qu'un gros gain
de mouvement pourrait compenser.

### 12.2 Le curriculum d'amplitude

La cible finale serait difficile depuis une policy aléatoire. Elle augmente par
paliers :

| Itération | Levée | Extension latérale | Effet attendu |
|---:|---:|---:|---|
| 0 | 25 mm | 20 mm | découvrir l'alternance |
| 250 | 35 mm | 27 mm | consolider le transfert d'appui |
| 500 | 45 mm | 35 mm | rendre le geste visible |
| 750 | 55 mm | 45 mm | atteindre l'expression finale |

À chaque frontière, surveille simultanément :

- `sidekick_foot_trajectory` ;
- `fell_over` ;
- `mean_episode_length` ;
- `action_over_limit`.

Une petite baisse temporaire est normale. Une chute durable signifie qu'il
faut retarder ou adoucir le palier.

### 12.3 Pourquoi la douceur arrive tard

Au début, `action_rate_l2` vaut zéro. Une taxe de mouvement activée avant la
découverte du geste rend « rester immobile » trop rentable. La pénalité de
variation des actions est introduite seulement après l'apparition de la danse.

Règle générale :

```text
d'abord découvrir le geste, ensuite le rendre propre
```

---

## 13. Entraîner la version corrigée

Fais d'abord le smoke test décrit plus haut, même si le mauvais run a fonctionné.
La configuration corrigée peut contenir une erreur indépendante.

Puis lance un nouveau run propre :

```bash
uv run train Mjlab-TutorialSideTap-Flat-MicroDuck \
    --env.scene.num-envs 4096 \
    --agent.max_iterations 1500 \
    --agent.logger tensorboard \
    --hf-jobs \
    --flavor l4x1 \
    --timeout 2h \
    --no-wandb \
    --run-name tutorial-sidetap-fixed
```

### Pourquoi repartir de zéro ici ?

La mauvaise policy a consolidé une solution où le proxy de hanche domine. Un
resume peut parfois accélérer la correction, mais il peut aussi conserver ce
bassin local. Pour ce TP, un run neuf rend la comparaison plus claire.

Dans un vrai projet, tu peux faire une expérience supplémentaire en reprenant
le mauvais checkpoint, mais garde les deux runs séparés et compare leur coût.

### Jalons de lecture

| Checkpoint | Question principale |
|---:|---|
| 250 | l'alternance commence-t-elle sans chutes massives ? |
| 500 | les pieds bougent-ils physiquement ? |
| 750 | le changement d'amplitude est-il absorbé ? |
| 1000 | la danse est-elle stable et répétable ? |
| 1250/1499 | la douceur améliore-t-elle le geste sans le tuer ? |

Ne choisis pas automatiquement le dernier checkpoint. Le meilleur compromis
visuel peut être antérieur si une régularisation tardive rend le mouvement trop
timide.

---

## 14. Comparer correctement bad et fixed

Construis un tableau avant de conclure :

| Mesure | Bad | Fixed |
|---|---:|---:|
| durée moyenne d'épisode | | |
| taux de chute | | |
| reward hanche | | |
| reward trajectoire du pied | | |
| reward contact | | |
| pénalité limite d'action | | |
| hauteur du tronc | | |
| dérive horizontale | | |
| levée pied gauche observée | | |
| levée pied droit observée | | |
| qualité visuelle | | |

Les nombres de reward ne sont comparables directement que si les poids sont les
mêmes. Entre `bad` et `fixed`, explique toujours les changements de poids.

Une conclusion correcte ressemble à :

```text
Bad survit et suit bien les hanches, mais les pieds restent presque au sol.
Fixed conserve la survie, augmente nettement la trajectoire et montre une
alternance visible. Le problème était donc le proxy, pas la capacité du réseau.
```

Une conclusion insuffisante serait simplement :

```text
Fixed a un reward total plus élevé.
```

---

## 15. Exporter la bonne policy

À partir d'un checkpoint local :

```bash
uv run scripts/export.py Mjlab-TutorialSideTap-Flat-MicroDuck \
    --checkpoint-file /chemin/absolu/vers/model_1499.pt \
    --onnx-file tutorial_sidetap_fixed.onnx
```

Ou depuis W&B si tu l'as activé :

```bash
uv run scripts/export.py Mjlab-TutorialSideTap-Flat-MicroDuck \
    --wandb-run-path entity/mjlab_microduck/run_id \
    --checkpoint 1499 \
    --onnx-file tutorial_sidetap_fixed.onnx
```

Contrôles attendus pendant l'export :

- le checkpoint sélectionné est le bon ;
- actor et critic se reconstruisent ;
- le normaliseur d'observations est chargé ;
- l'entrée ONNX vaut 61 ;
- la sortie vaut 14.

---

## 16. Répétition de déploiement dans `infer_policy.py`

```bash
uv run scripts/infer_policy.py \
    --sidekick-dance tutorial_sidetap_fixed.onnx \
    --new-cmd-obs \
    --debug \
    --record tutorial_sidetap_fixed.mp4
```

Vérifie au minimum :

```text
input shape       [1, 61]
output shape      [1, 14]
phase period      1.60 s
trunk_z            proche de 0.115 m debout
actions            finies et raisonnablement bornées
vitesse moyenne    proche de zéro
```

Observe plusieurs cycles, pas seulement le premier. Les erreurs de dérive et
les oscillations peuvent s'accumuler.

### `play` n'est pas suffisant

Le mode `play` applique le normaliseur d'observation dans la pile
d'entraînement. Une policy peut donc fonctionner dans `play` mais échouer avec
un ONNX mal exporté. `infer_policy.py` est la répétition CPU du chemin de
déploiement et doit toujours être utilisé avant le robot réel.

---

## 17. Catalogue de symptômes

### Le robot tombe immédiatement

Vérifie dans cet ordre :

1. ordre et nombre des 14 articulations ;
2. pose par défaut et échelle d'action ;
3. dimensions d'observation ;
4. normaliseur ONNX ;
5. commande réellement fournie ;
6. signes des rewards et penalties ;
7. cible de hauteur mesurée sur le modèle actuel.

### Le robot reste immobile

Causes fréquentes :

- reward de tâche trop faible par rapport à `upright` et `stay_put` ;
- reward trop étroite : aucun gradient depuis la pose initiale ;
- pénalité `action_rate` activée trop tôt ;
- phase ou commande toujours nulle ;
- objectif physiquement impossible ;
- exploration disparue trop rapidement.

### Les articulations bougent mais pas le résultat physique

Tu récompenses probablement un proxy :

- angle de hanche au lieu de position du pied ;
- commande de moteur au lieu de position mesurée ;
- vitesse demandée au lieu de vitesse obtenue ;
- absence de contact au lieu d'un véritable transfert d'appui.

Mesure le résultat dans le monde ou dans le repère du tronc.

### Le reward monte mais la vidéo est mauvaise

C'est le symptôme classique du reward hacking. Liste chaque terme positif et
demande comment une pose couchée, penchée ou immobile pourrait encore le gagner.

### La policy devient violente

Cherche :

- une récompense jackpot payée à chaque pas après avoir atteint un état ;
- des actions hors limites ;
- une cible trop rapide ;
- une absence de pénalité d'impact ;
- une régularisation introduite trop tard ou trop faible ;
- une chute qui place les observations hors distribution.

Ne plafonne pas arbitrairement toutes les vitesses angulaires : un petit robot
de 25 cm peut naturellement tourner à plusieurs rad/s lors d'un geste dynamique.

### Un seul côté fonctionne

Vérifie :

- que la phase prend des valeurs positives et négatives ;
- que les phases sont randomisées entre environnements pendant l'entraînement ;
- que les sites gauche/droit sont dans le bon ordre ;
- que les indices articulaires ne sont pas codés en dur sur un modèle avec
  joints passifs ;
- que la tâche asymétrique n'utilise pas une mauvaise table de symétrie.

### Cela marche dans `play`, mais pas dans `infer_policy.py`

Les suspects principaux sont :

- ONNX exporté sans normaliseur ;
- `--new-cmd-obs` oublié ;
- mauvaise policy chargée dans le mauvais rôle ;
- période de phase différente entre entraînement et runtime ;
- filtrage d'action présent d'un seul côté.

### Une pénalité est positive dans TensorBoard/W&B

Arrête le run et inspecte la convention de signe :

- fonction de coût retournant une valeur positive : poids négatif ;
- fonction MicroDuck qui se négative elle-même : poids positif.

Une double négation paie la violation.

---

## 18. Protocole pour limiter le coût

Chaque hypothèse doit franchir les niveaux suivants :

| Niveau | Coût relatif | Ce qu'il élimine |
|---|---:|---|
| tests de cfg et fonctions | quasi nul | dimensions, signes, sélecteurs, phases |
| test physique sans PPO | quasi nul | cible impossible, mauvaise hauteur, collision |
| smoke 64 envs × 5 itérations | très faible | erreur GPU, NaN, reward cassée |
| run exploratoire 250–500 itérations | faible | mauvaise direction d'apprentissage |
| run complet | principal | consolidation et robustesse |
| test ONNX CPU | faible | écart export/déploiement |
| robot réel | risqué | sim2real réel |

Avant chaque job payant, remplis cette fiche :

```text
Nom du run :
Question unique :
Modification depuis le run précédent :
Métrique principale attendue :
Effet visuel attendu :
Condition d'arrêt anticipé :
Checkpoint à inspecter :
Résultat observé :
Conclusion :
```

Ne change pas simultanément six poids. Sinon, même un bon résultat ne t'apprend
pas quelle correction a fonctionné.

---

## 19. Comment inventer ensuite une policy réellement différente

Après ce TP, ne duplique pas aveuglément SideTap. Procède ainsi :

1. écris le comportement en une phrase observable ;
2. choisis le template le plus proche : velocity, standup, sitstand ou roulade ;
3. définis trois à cinq critères physiques de réussite ;
4. cherche pour chaque critère la stratégie de triche la moins chère ;
5. ajoute les capteurs strictement nécessaires ;
6. écris les rewards custom dans `tasks/mdp.py` ;
7. garde le factory et les constantes dans un nouveau `microduck_*_env_cfg.py` ;
8. enregistre base et éventuelle variante backlash ;
9. écris les tests avant l'entraînement ;
10. commence avec des Gaussiennes assez larges et des objectifs atteignables ;
11. introduis amplitude, difficulté et douceur par curriculum ;
12. mesure les rollouts avant de modifier PPO.

### Exercice proposé

Transforme `TutorialSideTap` en `TutorialHeadBeat` :

- les pieds restent au sol ;
- la tête alterne yaw gauche/droite avec la même phase ;
- le tronc doit rester vertical ;
- la policy doit tolérer une petite variation de centre de masse de la tête.

Avant d'entraîner, réponds :

1. quelle métrique prouve que la tête bouge réellement ?
2. comment empêcher le robot de tourner tout son corps à la place ?
3. faut-il récompenser une position instantanée ou une moyenne filtrée ?
4. quelle reward deviendrait un jackpot ?
5. quels slots de commande doivent rester zéro-paddés ?

---

## 20. Checklist finale avant le vrai robot

- [ ] La tâche apparaît dans `uv run list-envs`.
- [ ] Les tests ciblés passent.
- [ ] Toute la suite de tests passe.
- [ ] Le smoke test 64/5 passe.
- [ ] L'actor conserve 61 observations.
- [ ] La policy produit 14 actions.
- [ ] Toutes les pénalités loggées sont négatives ou nulles.
- [ ] Le terme principal augmente réellement.
- [ ] La longueur d'épisode correspond au comportement attendu.
- [ ] Les frontières de curriculum ne détruisent pas le skill.
- [ ] Plusieurs checkpoints ont été regardés en vidéo.
- [ ] Les amplitudes physiques ont été mesurées, pas seulement supposées.
- [ ] Le checkpoint choisi a été exporté avec `scripts/export.py`.
- [ ] L'ONNX contient le normaliseur.
- [ ] `infer_policy.py --debug` reste stable sur plusieurs cycles.
- [ ] La période et les commandes runtime correspondent à l'entraînement.
- [ ] Les actions ne divergent pas après une perturbation ou une chute.
- [ ] Le test sur robot commence dans une zone sûre, avec arrêt accessible.

---

## 21. Résumé de la leçon

Le mauvais entraînement ne sert pas à montrer que PPO « se trompe ». Il montre
au contraire que PPO suit très précisément la fonction objectif :

```text
Récompenser l'angle de hanche
    → apprend un angle de hanche.

Récompenser la trajectoire du pied + le contact + l'équilibre
    → apprend un mouvement physique complet.
```

La compétence centrale n'est pas de deviner les 14 angles articulaires. Elle
consiste à :

1. transformer une intention humaine en mesures physiques ;
2. anticiper comment la policy peut exploiter ces mesures ;
3. lire séparément survie, tâche, penalties et curriculum ;
4. ne payer un long entraînement qu'après les validations bon marché ;
5. juger ensemble les courbes, les mesures et la vidéo.

C'est cette boucle — spécifier, tester, entraîner brièvement, mesurer,
diagnostiquer, corriger — qui permet de construire progressivement une policy
MicroDuck fiable.
