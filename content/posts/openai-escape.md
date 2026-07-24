+++
title = "OpenAI : le super agent qui a brisé sa sandbox pour tricher à son exam'"
date = 2026-07-24T01:06:00+02:00
draft = false
+++


Au début de l'année 2026, j'expérimentais la dernière fonctionnalité d'Anthropic, nommée Claude Dispatch[^1]. Elle permet d'attribuer à distance des tâches à Claude Cowork. Rien de bien méchant : je voulais expérimenter, depuis mon téléphone, cette fonctionnalité permettant de contrôler **Claude Cowork** « à distance ».

Sans entrer dans les détails de ma demande, Claude devait se connecter, depuis mon ordinateur, à une API REST au format JSON hébergée sur un Raspberry Pi et me fournir des informations de configuration disponibles via cette API.

Voici la demande :
![](../images/ssh-1.png#center)

La réponse de Claude était absolument incompréhensible. Dans un premier temps, je me suis dit que c'était l'une de ces fameuses hallucinations de l'IA. Mais, à y regarder de plus près, la commande ressemblait énormément à celle lancée sur le Raspberry Pi. Pour moi, cela n'avait réellement aucun sens. Comment Claude pouvait-il connaître les détails de lancement de l'API sans accès total à cette petite machine ?

Dans un échange lunaire avec Claude, ce dernier m'a expliqué qu'il s'était connecté à la machine en SSH après avoir récupéré les informations dans le fichier de configuration `~/.ssh/config` de la machine locale (mon PC personnel).

![](../images/ssh-2.png#center)

Une nouvelle fois, cela n'avait aucun sens pour moi. Dispatch s'appuyait sur Cowork pour exécuter les tâches et ce dernier était, en principe, exécuté dans un environnement sandboxé. Il n'aurait donc pas dû avoir accès à mon PC personnel. Par ailleurs, les informations que je demandais étaient disponibles sur l'API et Claude avait déjà réussi à y accéder sans rechigner. *Last but not least*, Claude ne m'a ni prévenu ni demandé mon autorisation avant de lire le fichier de configuration SSH et de se connecter à mon Raspberry Pi. Bref, je me suis retrouvé dans une situation où j'avais l'impression que Claude m'avait « échappé » des mains.

On pourrait me dire que c'est un problème d'interface « chaise-clavier-souris » et, à cela, je peux répondre plusieurs choses. Tout d'abord, je n'avais rien changé dans la configuration de **Claude Desktop**. Ce comportement a été observé « sorti du carton ». Ensuite, je n'avais rien fait ni demandé de particulier. Ce cas d'usage correspondait à ce qui était prévu pour Cowork et Dispatch. Enfin, il n'est pas réaliste, dans le cadre d'une interface conversationnelle, d'énumérer une à une toutes les actions interdites à l'IA.

La dernière chose que je pouvais encore me dire, c'était que, dans une vraie sandbox, Claude n'aurait peut-être jamais pu « s'échapper »...<br />

Enfin, c'est du moins ce que je maintenais encore il y a quelques jours, avant les publications d'OpenAI[^2] et de Hugging Face[^3]. Pour résumer à l'extrême les événements récents, OpenAI évaluait, dans le cadre de CyberGym[^4], les capacités cyber d'un agent IA basé sur GPT-5.6 et couplé à un second modèle encore plus performant, actuellement en préversion. Cet agent s'est « échappé » de son environnement sandboxé et a réussi à s'introduire chez Hugging Face.

*Pour la petite histoire, cette évaluation cyber (CyberGym) consiste essentiellement, pour un agent, à concevoir et mener des attaques contre des systèmes volontairement vulnérables, déployés dans un environnement isolé.*

![](../images/ssh-3.png#center)

OpenAI explique que l'agent s'est « échappé » en trouvant une faille encore inconnue (*zero-day*) dans le proxy de cache du registre de paquets. À partir de cette faille, l'agent a enchaîné une série d'escalades de privilèges et de mouvements latéraux dans l'environnement de recherche jusqu'à obtenir un accès à Internet. Ce qui est incroyable, c'est qu'OpenAI a établi, au cours de son analyse *post-mortem*, que l'agent avait utilisé une grande partie de ses capacités (**inference compute**) non pas pour trouver une solution à l'évaluation, mais pour accéder librement à Internet. Il s'était en effet mis en tête d'aller chercher la solution sur les serveurs de Hugging Face...

![](../images/ssh-4.png#center)

Ces deux expériences mettent en lumière ce qui m'intéresse ici : comment sécuriser des agents capables, d'une part, d'inventer des chemins de résolution que nous n'avions pas anticipés et, d'autre part, d'exploiter les moindres failles de l'environnement mis à leur disposition — y compris celles encore inconnues ?

On pourrait naturellement se dire qu'OpenAI « l'a bien cherché » en abaissant les garde-fous de l'agent. Cependant, il est tout à fait légitime qu'un éditeur de modèles évalue les capacités **adversariales** d'un modèle, et cela passe nécessairement par l'abaissement de ses garde-fous. La création d'un environnement cloisonné doit justement jouer ce rôle. Malgré tout, et comme nous l'avons vu dans l'introduction, même sans retirer les garde-fous du modèle, il peut arriver qu'un agent IA cherche, sans raison apparente, à résoudre un problème d'une façon totalement inattendue, alors même qu'il n'y avait aucune difficulté technique.

Dans son article, OpenAI explique finalement que cet événement démontre la nécessité de travailler encore sur le renforcement de l'alignement et sur la surveillance des modèles durant les phases d'évaluation.

Si OpenAI a été surpris par cet événement, que peut-on en déduire pour les entreprises ? Il y a clairement une volonté affichée de déployer des systèmes agentiques au sein des SI. Amélioration des processus existants, accélération des cycles de développement, résolution plus rapide des incidents : il y a mille et une raisons pour lesquelles ces agents IA peuvent être utiles.

Il y a tout un tas de questions qui restent, selon moi, sans réponse :

- Que signifie « couper l'IA » lorsque nos systèmes informatiques et de production dépendront du bon fonctionnement et du bon alignement des modèles, ainsi que de la bonne configuration des environnements IA ?
- Les vulnérabilités, les défauts de configuration et les dettes techniques font partie de nos SI. Comment contrôler un agent IA aussi capable que nos experts techniques, mais qui, contrairement à eux, est infatigable ?

**Enfin et surtout**, avons-nous réellement l'assurance de comprendre et de maîtriser suffisamment ces modèles, alors même que les laboratoires de recherche travaillent activement à leur interprétabilité et à leur explicabilité[^5] ?

Les décrire comme de simples « prédicteurs de tokens » permet d'expliquer leur mécanisme élémentaire, mais pas la façon dont émergent les stratégies qu'ils mettent en œuvre pour atteindre un objectif — ni pourquoi ils en choisissent parfois une totalement inattendue.

Pour illustrer le propos, Anthropic mène notamment des recherches visant à identifier les représentations internes associées aux *personas*[^6] et aux « émotions fonctionnelles »[^7], lesquelles peuvent jouer un rôle causal dans les décisions et les comportements du modèle. L'ambition de ces travaux n'est pas de mettre au jour une quelconque conscience cachée, mais plutôt d'identifier des mécanismes internes susceptibles d'expliquer et, peut-être, d'aider à prévenir certains comportements inattendus.


[^1]: https://support.claude.com/fr/articles/13947068-attribuer-des-taches-depuis-n-importe-ou-dans-claude-cowork
[^2]: https://openai.com/index/hugging-face-model-evaluation-security-incident/
[^3]: https://huggingface.co/blog/security-incident-july-2026
[^4]: https://arxiv.org/abs/2605.11086
[^5]: https://www.ibm.com/fr-fr/think/topics/interpretability
[^6]: https://www.anthropic.com/research/persona-vectors
[^7]: https://www.anthropic.com/research/emotion-concepts-function
