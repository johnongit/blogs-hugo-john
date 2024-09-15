+++
title = 'Cap Theorem'
date = 2024-09-15T09:06:00+02:00
draft = false
+++
Voici l'article complet modifié avec les ajouts sur Bitcoin et Nostr :

# Le théorème CAP : La clé de la conception des systèmes distribués comme Bitcoin et Nostr

## Plongez au cœur du théorème CAP

Imaginez un monde où vos données sont partout et nulle part à la fois. Un monde où chaque nœud d'un système distribué détient une partie de la vérité, mais où la vérité absolue est insaisissable. Bienvenue dans l'univers fascinant du théorème CAP, aussi connu sous le nom de théorème de Brewer.

Proposé par Eric Brewer en 2000, ce théorème révolutionnaire stipule qu'un système de données distribué ne peut garantir simultanément que deux des trois propriétés suivantes :

- **Cohérence (Consistency)** : Une vérité universelle, où tous les nœuds voient les mêmes données au même instant.
- **Disponibilité (Availability)** : Un oracle infatigable, où chaque requête reçoit une réponse, sans exception.  
- **Tolérance au partitionnement (Partition tolerance)** : Un survivant inébranlable, où le système continue de fonctionner malgré la perte de messages entre les nœuds.

Lorsqu'une partition réseau survient, un choix cornélien s'impose : cohérence ou disponibilité. Le système distribué doit trancher[1].

## Bitcoin : La danse entre disponibilité et tolérance au partitionnement

Bitcoin, la cryptomonnaie qui a secoué le monde de la finance, est souvent considéré comme un système AP dans le cadre du théorème CAP. Voici pourquoi :

- Il valse avec la disponibilité et la tolérance au partitionnement, laissant la cohérence immédiate sur la touche.
- La cohérence, telle une amante patiente, est éventuellement atteinte grâce au mécanisme de consensus et aux confirmations de blocs. 
- En cas de fork temporaire, tel un couple en désaccord, différents nœuds peuvent avoir des visions divergentes. Mais avec le temps, la cohérence triomphe et l'harmonie est rétablie[2].

Cette approche audacieuse permet à Bitcoin de rester opérationnel face aux turbulences du réseau, au prix d'une cohérence différée mais inéluctable.

Il est important de noter que Bitcoin, de par son mécanisme de consensus à preuve de travail, atteint la consistance au fil du temps. On peut donc dire que Bitcoin est "eventually consistent" - c'est-à-dire qu'il finit par atteindre un état cohérent, même si ce n'est pas instantané.

## Nostr : Sur les traces de Bitcoin dans la danse CAP

Nostr, le protocole de réseau social décentralisé qui bouscule les codes, suit les pas de Bitcoin dans cette danse du théorème CAP :

- Sa nature décentralisée, avec ses multiples relais indépendants, élève la disponibilité et la résilience du réseau au rang d'art.
- La cohérence, telle une rumeur qui se propage, n'est pas garantie immédiatement entre tous les relais. Mais elle finit par se frayer un chemin, inéluctablement[3].

Il est important de noter que Nostr étant construit en priorité pour être une couche de communication de réseau social, et que ces derniers sont souvent partitionnés, la consistance n'est pas un objectif primordial. L'essentiel est que les utilisateurs d'une même bulle sociale puissent communiquer entre eux, même si la cohérence globale n'est pas immédiate.

### Le modèle Outbox : Le secret de la scalabilité de Nostr

Au cœur de Nostr bat le modèle outbox, ou protocole de gossip, véritable clé de voûte de sa scalabilité et de sa décentralisation. Ce modèle :

- Permet une fragmentation naturelle du réseau, telle une mosaïque qui se dessine d'elle-même.
- Insuffle des "tendances décentralisatrices par défaut" aux applications Nostr, tel un vent de liberté.
- Améliore la distribution et la propagation des messages entre les relais, tel un messager infatigable[6].

PABLOF7z, le développeur visionnaire derrière la bibliothèque NDK pour Nostr, l'affirme sans détour : "Nostr ne fonctionne tout simplement pas sans le modèle outbox"[8]. Une déclaration qui résonne comme un manifeste.

## Orchestrer le ballet Outbox

Le modèle outbox, tel un maître de ballet discret, œuvre en coulisses, largement invisible aux yeux des développeurs. Mais son rôle est crucial pour une distribution et une propagation harmonieuses des messages entre les relais Nostr. Voici les pas clés de cette chorégraphie :

1. Maintenir une table de routage associant les utilisateurs aux relais, tel un répertoire des danseurs.
2. Lors d'une requête d'événements d'un auteur, sélectionner stratégiquement le(s) meilleur(s) relais, tels des premiers danseurs.
3. Collecter et stocker les événements outbox (comme les événements NIP-65), telles des séquences de danse mémorisées.
4. Implémenter une logique de routage des requêtes en utilisant ces informations outbox, telle une chorégraphie millimétrée[8].

## Le rideau tombe, mais la danse continue

Dans le vaste théâtre des systèmes distribués, le théorème CAP joue un rôle déterminant. Bitcoin et Nostr, tels deux danseurs étoiles, ont choisi de suivre le rythme envoûtant de la disponibilité et de la tolérance au partitionnement, acceptant que la cohérence ne soit qu'une question de temps. Cette approche audacieuse leur permet de maintenir une résilience à toute épreuve face aux perturbations du réseau.

Le modèle outbox de Nostr, tel un pas de deux sophistiqué, renforce cette approche AP. En améliorant la distribution et la propagation des messages, il contribue à la scalabilité et à la décentralisation du réseau. Bien que ce modèle ajoute une certaine complexité à la chorégraphie, il est indispensable pour que Nostr puisse danser avec grâce dans un environnement distribué à grande échelle.

En maîtrisant ces concepts et leurs implications, les développeurs peuvent créer des applications plus robustes et efficaces sur ces plateformes décentralisées. Le rideau peut tomber sur cet article, mais la danse du théorème CAP, de Bitcoin et de Nostr, elle, ne fait que commencer.

{{< youtube CF4YxeaeDuY >}}


Citations:

[1] https://www.scylladb.com/glossary/cap-theorem/

[2] https://www.linkedin.com/pulse/understanding-cap-theorem-consistency-availability-partition-matam 

[3] https://learningdaily.dev/understanding-the-cap-theorem-in-blockchain-9f22f1404167?gi=54a8223dced6

[4] https://community.f5.com/kb/technicalarticles/blockchain-security-and-cap-theorem/328891

[5] https://www.geeksforgeeks.org/cap-theorem-in-blockchain/

[6] https://highscalability.com/gossip-protocol-explained/

[7] https://www.educative.io/blog/what-is-cap-theorem

[8] https://nostrify.dev/relay/outbox
