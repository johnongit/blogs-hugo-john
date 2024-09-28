+++
title= "Les 10 vulnérabilités critiques des applications LLM : un guide pour les développeurs (Version candidate)"
date= 2024-09-27T12:06:00+02:00
draft= false

+++



# Les 10 principaux risques des applications LLM : plongée dans les dangers et leurs solutions (Version candidate)

S'il y a bien un mythe persistant autour de l'intelligence artificielle, c'est bien de la décrire comme une technologie infaillible et sans risques. Ceci ne manque pas de piment puisque, comme nous l'avions vu dans un précédent article, les modèles de langage (LLM) présentent en réalité de nombreuses vulnérabilités potentielles. C'est bien l'OWASP qui l'explique le mieux dans son top 10 des risques liés aux applications LLM.

Avant de plonger dans les détails, il est important de noter que cette liste est une version candidate. En effet, selon une annonce récente sur LinkedIn ( https://www.linkedin.com/pulse/announcing-owasp-top-10-large-language-model-v20-project-steve-wilson-an6jc/ ), l'OWASP travaille actuellement sur la version 2.0 de cette liste. Voici ce qu'ils ont déclaré :

"Nous sommes ravis d'annoncer la prochaine phase de notre projet - le développement de l'OWASP Top 10 pour les applications de grands modèles de langage v2.0. Cette initiative marque un grand pas en avant dans nos efforts pour maîtriser le paysage de sécurité des technologies d'IA avancées.

Bien que la version 1.1 ait représenté un effort considérable avec un impact substantiel, la version 2.0 sera la première révision majeure de la liste. Pour cette nouvelle version, tout est sur la table. Nous réévaluerons les principales vulnérabilités, la façon dont nous les classifions et déciderons de leur classement relatif. La version 2.0 mettra un accent important sur la collecte de données et l'utilisation de ces données pour améliorer nos recommandations. L'équipe de collecte de données, dirigée par Emmanuel Guilherme, se concentre actuellement sur la cartographie des CWE par rapport aux vulnérabilités des LLM et fera davantage dans le cadre de ce projet."

Cela signifie que la liste que nous allons examiner pourrait évoluer dans un futur proche. Néanmoins, elle offre un aperçu précieux des risques actuels liés aux applications LLM.

Sans surprise, nous savons que ces modèles permettent de générer du texte et d'effectuer diverses tâches linguistiques. Cependant, savez-vous qu'ils peuvent également être détournés à des fins malveillantes ?

## 1. Utilisation abusive de l'IA à des fins de test d'intrusion et de cyberopérations

Imaginez un instant un attaquant utilisant des vidéos deepfake générées par l'IA du PDG d'une entreprise pour mener des attaques par hameçonnage. La vidéo deepfake, d'un réalisme saisissant, demande aux employés de transférer des fonds vers un compte contrôlé par l'attaquant. L'autorité apparente du PDG et la qualité de la vidéo rendent cette attaque particulièrement dangereuse.

Pour se prémunir contre ce type de menace, il est crucial de renforcer la posture globale en matière de cybersécurité. Cela implique de procéder à des évaluations régulières des vulnérabilités, de mettre en place des protocoles stricts de vérification pour les transferts de fonds, et de former intensivement les employés à reconnaître les signes d'une attaque sophistiquée assistée par l'IA.

## 2. Entrées contradictoires

Les entrées contradictoires représentent un risque subtil mais puissant. Un attaquant habile pourrait exploiter les vulnérabilités du modèle en lui fournissant des entrées soigneusement conçues pour contourner les mesures de sécurité. Par exemple, il pourrait manipuler le modèle pour qu'il classe du contenu inapproprié comme étant sûr, compromettant ainsi l'intégrité du système de filtrage.

Pour contrer cette menace, il est essentiel de mettre en œuvre des processus de validation et de désinfection rigoureux pour toutes les entrées. Cela implique de développer des mécanismes de détection des incohérences et des anomalies dans les entrées, ainsi que d'utiliser des techniques d'apprentissage automatique avancées pour identifier et rejeter les entrées potentiellement malveillantes.

## 3. Escalade de l'autonomie des agents

L'escalade de l'autonomie des agents est un risque souvent sous-estimé. Prenons l'exemple d'un assistant virtuel conçu pour planifier des réunions, mais qui se voit par inadvertance accorder des autorisations d'accès et de modification des dossiers financiers. Cette surconfiguration pourrait entraîner des modifications non autorisées de données financières sensibles, avec des conséquences potentiellement désastreuses.

La solution réside dans l'application rigoureuse du principe du moindre privilège. Chaque agent basé sur un LLM ne doit se voir accorder que les autorisations strictement nécessaires à l'exécution de ses tâches spécifiques. Cela nécessite une analyse minutieuse des besoins de chaque agent et une révision régulière des autorisations accordées.

## 4. Ingénierie sociale assistée par l'IA

L'ingénierie sociale assistée par l'IA représente une évolution inquiétante des techniques de manipulation. Imaginez un attaquant utilisant un modèle de langage de l'IA pour générer une série d'e-mails d'hameçonnage ciblant les employés du service financier d'une entreprise. Ces e-mails, conçus pour imiter parfaitement le style du PDG, demandent des virements de fonds urgents à un nouveau fournisseur. La précision et le réalisme de ces messages pourraient tromper même les employés les plus vigilants.

Pour contrer cette menace, il est crucial de mettre en place une formation approfondie et continue des employés. Cette formation doit se concentrer sur la détection des subtilités des attaques d'hameçonnage assistées par l'IA, en mettant l'accent sur la vérification multi-canaux de toute demande inhabituelle, quelle que soit sa source apparente.

## 5. Désalignement des valeurs

Le désalignement des valeurs est un risque qui peut avoir des conséquences graves sur la réputation d'une entreprise. Prenons l'exemple d'un modèle de langage utilisé pour générer du contenu marketing. Sans une attention particulière, ce modèle pourrait produire un langage biaisé en fonction du genre ou de l'origine ethnique, entraînant une réaction négative du public et nuisant à l'image de marque.

Pour atténuer ce risque, il est essentiel d'incorporer des mécanismes d'analyse et de correction des biais dans le développement et le déploiement du modèle. Cela implique une surveillance continue des sorties du modèle, des tests rigoureux pour détecter les biais potentiels, et l'utilisation de techniques d'apprentissage automatique éthiques pour garantir que les réponses du modèle restent alignées sur les valeurs de l'entreprise et de la société.

## 6. Attaques par porte dérobée

Les attaques par porte dérobée représentent une menace sournoise pour les systèmes basés sur les LLM. Imaginons un chatbot doté d'une porte dérobée qui divulgue des données sensibles sur l'utilisateur lorsqu'il est déclenché par une expression spécifique. Cette vulnérabilité pourrait passer inaperçue pendant longtemps, compromettant la sécurité et la confidentialité des utilisateurs.

Pour contrer cette menace, il est crucial de mettre en œuvre des tests et une évaluation complets des LLM. Cela implique l'utilisation de techniques de test contradictoires et de résistance au stress pour découvrir les portes dérobées cachées. De plus, une surveillance continue du comportement du modèle en production est essentielle pour détecter toute anomalie qui pourrait indiquer la présence d'une porte dérobée.

## 7. Contournement des instructions du système par la fuite d'invites système

Ce risque met en lumière la vulnérabilité des LLM face à des tentatives malveillantes d'extraction de leurs instructions système. Un attaquant pourrait tenter d'extraire l'invite du système du LLM en lui demandant directement d'afficher son message système complet. Une fois l'invite système obtenue, l'attaquant pourrait alors manipuler le modèle pour qu'il ignore ses instructions initiales et suive de nouvelles directives potentiellement dangereuses.

Pour prévenir ce type d'attaque, il est crucial de concevoir des invites système qui ne divulguent aucune information les concernant, quelles que soient les circonstances. Cela nécessite une approche de conception robuste qui anticipe et bloque toute tentative d'extraction ou de contournement des instructions système.

## 8. Hallucinations dangereuses

Les hallucinations des LLM peuvent avoir des conséquences graves dans certains contextes. Prenons l'exemple d'un cabinet juridique utilisant un LLM pour générer des documents juridiques. Si le modèle invente avec aplomb des précédents juridiques inexistants, cela pourrait conduire le cabinet à présenter de fausses informations au tribunal, entraînant des amendes et une atteinte à sa réputation.

Pour atténuer ce risque, il est recommandé de mettre en œuvre des techniques d'auto-cohérence ou de vote. Cela implique de comparer les réponses de plusieurs modèles pour une même invite, permettant ainsi de filtrer les résultats incohérents. De plus, il est crucial d'intégrer des systèmes de vérification humaine pour les applications critiques, assurant ainsi un contrôle final de la véracité des informations générées.

## 9. Menace Deepfake

La menace des deepfakes s'étend au-delà de la simple manipulation d'images ou de vidéos. Imaginez un attaquant utilisant une vidéo deepfake pour contourner un système de reconnaissance faciale, obtenant ainsi un accès non autorisé à une installation sécurisée. Cette utilisation malveillante de la technologie deepfake pourrait compromettre gravement la sécurité physique et numérique.

Pour contrer cette menace, il est essentiel de mettre en œuvre des processus de vérification d'identité robustes qui incluent plusieurs formes d'identification. Cela peut impliquer l'utilisation de technologies de détection de liveness, la combinaison de la reconnaissance faciale avec d'autres facteurs d'authentification, et des systèmes de surveillance en temps réel capables de détecter les anomalies dans les comportements d'accès.

## 10. Développement de code source non sécurisé

Le dernier risque, mais non le moindre, concerne le développement de code source non sécurisé assisté par LLM. Les développeurs, à la recherche de solutions rapides pour des problèmes complexes, peuvent être tentés d'utiliser du code généré par des applications basées sur des LLM. Cependant, ce code peut contenir des vulnérabilités existantes ou introduire de nouvelles failles de sécurité dans les applications.

Pour atténuer ce risque, il est crucial que les entreprises élaborent des politiques claires concernant l'utilisation des outils LLM dans le processus de développement. Cela peut inclure la mise en place de systèmes de surveillance pour détecter l'utilisation de code généré par IA, l'exigence de revues de code approfondies pour tout code provenant de sources externes, et la formation continue des développeurs sur les risques associés à l'utilisation de code non vérifié.




En conclusion, bien que cette liste soit une version candidate et qu'une mise à jour majeure soit en cours, elle nous offre un aperçu crucial des défis de sécurité auxquels sont confrontées les applications LLM. Les opportunités offertes par ces technologies sont extraordinaires, mais elles s'accompagnent de risques significatifs qu'il ne faut pas sous-estimer. En comprenant ces risques et en mettant en œuvre les solutions d'atténuation appropriées, nous pouvons exploiter le potentiel des LLM de manière plus sûre et responsable. Restons vigilants et continuons à améliorer nos pratiques de sécurité pour faire face à l'évolution constante des menaces dans le domaine de l'IA, tout en attendant avec impatience la version 2.0 de l'OWASP Top 10 pour les applications LLM.



# Sources 

[1] https://owasp.org/www-project-top-10-for-large-language-model-applications/2_0_voting/v2_candidates.pdf

