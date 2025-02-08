+++
title = "Expérimentation - Open deep-research"
date = 2025-02-08T05:06:00+02:00
draft = false
+++

Le rapport suivant est un issu d'une expérimentation de génération de contenu par l'outil libre [deep-research](https://github.com/dzhng/deep-research). Ce projet est une tentative de reprendre fonctionnallement la récente technologie de OpenAI [DeepResearch](https://openai.com/index/introducing-deep-research/) (Actuellement réservé aux utilisateurs 'Pro'). Je vous invite à découvrir par vous-mêmes le repo github du projet pour plus d'informations.

---

# Rapport SSI sur Microsoft Copilot pour Power BI et la Power Platform

_Date du rapport : 8 février 2025_

---

## Table des matières

1. [Introduction et Contexte](#introduction-et-contexte)
2. [Architecture et Environnements d'Exécution](#architecture-et-environnements-dexécution)
3. [Respect des Réglementations et Conformité](#respect-des-réglementations-et-conformité)
   - 3.1 [Cadre Européen : RGPD, DMCA et IA Act](#cadre-européen-rgpd-dmca-et-ia-act)
   - 3.2 [Engagements en Matière de Data Residency](#engagements-en-matière-de-data-residency)
4. [Confidentialité et Protection des Données](#confidentialité-et-protection-des-données)
   - 4.1 [Mesures Techniques et Chiffrement](#mesures-techniques-et-chiffrement)
   - 4.2 [Contrôles d’Accès et Gouvernance](#contrôles-daccès-et-gouvernance)
5. [Sécurité et Risques de Vulnérabilités](#sécurité-et-risques-de-vulnérabilités)
   - 5.1 [Mécanismes de Défense Contre les Jailbreaks](#mécanismes-de-défense-contre-les-jailbreaks)
   - 5.2 [Tests de Pénétration et Approches Hybrides](#tests-de-pénétration-et-approches-hybrides)
6. [Observabilité et Surveillance du Système](#observabilité-et-surveillance-du-système)
   - 6.1 [Métriques et Indicateurs Clés](#métriques-et-indicateurs-clés)
   - 6.2 [Outils de Monitoring et Limitations Avérées](#outils-de-monitoring-et-limitations-avérées)
7. [Recommandations et Pistes d'Amélioration](#recommandations-et-pistes-damélioration)
8. [Conclusion](#conclusion)

---

## Introduction et Contexte

Ce rapport détaille l'analyse de sécurité, de confidentialité et d'observabilité de l'outil Microsoft Copilot tel qu'intégré dans Power BI et la Power Platform. L'évaluation se fonde sur la documentation officielle de Microsoft, les récentes publications techniques de janvier et février 2025, ainsi que sur divers rapports spécialisés (notamment du Centre DPO et des analyses de Microsoft 365 Copilot). L'objectif principal est d'analyser comment Copilot respecte les règlements européens (notamment le RGPD, DMCA et l'IA Act), assure la confidentialité des données, maintient une architecture sécurisée, notamment face aux vulnérabilités type « jailbreak », et garantit une observabilité sufficient pour prévenir l'usage détourné du système.

## Architecture et Environnements d'Exécution

Microsoft Copilot est intégré de manière transparente dans l'écosystème Power BI et, plus largement, dans Microsoft Fabric. Son architecture combine plusieurs composants :

- **Modèles Sémantiques et DAX** : Utilisés pour générer des visualisations et des narrations automatisées basées sur les données utilisateurs.
- **Microsoft Graph et Data Residency Tools** : Permettent une interrogation sécurisée des données tout en garantissant leur confinement géographique, notamment via les configurations de Multi-Geo et Advanced Data Residency (ADR).
- **Intégration avec Azure OpenAI Service** : La couche IA repose sur des modèles déployés en configurations « Global » ou « DataZone » afin d’isoler les données au sein de régions spécifiées. Cela minimise les risques de transfert transfrontalier non autorisé de données.
- **Infrastructure Cloud Native** : Déployée via Azure App Services, Azure SQL et Azure Blob Storage avec chiffrement intégré (AES-256 au repos et en transit) ainsi qu’un audit multi-niveau géré par des milliers d’ingénieurs.

Ces composants garantissent un traitement des données conforme aux exigences des régulations européennes tout en permettant une exploitation avancée et sécurisée des données pour des besoins de Business Intelligence.

## Respect des Réglementations et Conformité

### Cadre Européen : RGPD, DMCA et IA Act

Microsoft a intégré dès le départ des mécanismes assurant le respect du RGPD. Parmi ceux-ci :

- **Confinement Géographique des Données** : Pour l'ensemble des utilisateurs européens, toutes les interactions, y compris les requêtes et les réponses générées par l’IA, sont maintenues dans l’UE. Ce mécanisme élimine les risques liés au transfert vers des régions non conformes.

- **DMCA et Protection de la Propriété Intellectuelle** : La gestion des droits d'accès et l'architecture de gouvernance des données intègrent des mécanismes visant à prévenir la redistribution non autorisée de contenu sensible, notamment grâce à des filtres de contenu et des contrôles d'accès dynamiques.

- **Anticipation de l’IA Act** : Bien que l'IA Act soit encore en phase d'adaptation, Microsoft adopte une posture proactive en intégrant des protocoles de confidentialité et de sécurité qui correspondent aux exigences anticipées, tout en s’appuyant sur des normes déjà éprouvées (ISO/IEC 27018 par exemple).

### Engagements en Matière de Data Residency

Les offres telles que Advanced Data Residency (ADR) et Multi-Geo garantissent que l'ensemble du trafic et des données reste dans des frontières définies par l'utilisateur (par exemple, au sein de l'UE/EEE). Les engagements incluent :

- **Confinement des Prompts et des Réponses** : Des politiques de rétention strictes (suppression automatique des prompts sous 30 à 180 jours) assurent le respect des règles établies par la Commission européenne.
- **Configurations Régionales** : En fonction des besoins utilisateurs, le routage des requêtes peut être adapté pour optimiser à la fois la performance et la conformité, en s'appuyant sur des configurations spécifiques à chaque région (UE, UK, Australie, US).

Cette approche démontre la volonté de Microsoft de rester en conformité avec la réglementation et d’adapter ses infrastructures en fonction des changements réglementaires futurs.

## Confidentialité et Protection des Données

### Mesures Techniques et Chiffrement

Microsoft Copilot déploie un arsenal de mesures techniques visant à protéger les données sensibles :

- **Chiffrement Avancé** : Utilisation du chiffrement AES-256 au repos et pendant les transmissions, ce qui offre une couche de protection robuste contre toute interception non autorisée.
- **Non-Rétention pour Entraînement** : Les prompts utilisateurs et les réponses générées ne sont pas utilisés pour entraîner les modèles d’IA, ce qui prévient un risque secondaire de fuite ou de réutilisation non autorisée des données.
- **Séparation des Données Sensibles** : Grâce à des politiques de sensibilité et à la gestion automatisée par Microsoft Purview, seuls les utilisateurs autorisés peuvent accéder aux données critiques.

### Contrôles d’Accès et Gouvernance

L'architecture de l'outil intègre des contrôles d'accès basés sur une gestion fine des permissions :

- **Authentification Basée sur Microsoft Entra** : Assure que chaque accès est authentifié et consigné via des logs d’audit rigoureux.
- **Automatisation et Sensitivity Labeling** : Des politiques automatisées de classification et d’étiquetage des données garantissent que les interactions avec l'outil respectent les règles internes et réglementaires.
- **DPIA et' Legitimate Interests Assessments** : Ces évaluations sont régulièrement mises à jour afin de répondre aux évolutions réglementaires et aux risques émergents en matière de confidentialité.

## Sécurité et Risques de Vulnérabilités

### Mécanismes de Défense Contre les Jailbreaks

Des tests de pénétration et des analyses comportementales spécifiques ont été conduits pour détecter l’existence de vulnérabilités de type jailbreak dans Copilot pour Power BI. Ces mesures comprennent :

- **Contrôles de Prompt Injection** : Des techniques de filtrage et de validation du contenu des prompts sont intégrées pour éviter des injections malveillantes visant à contourner la logique métier.
- **Sandboxing et Isolation** : L’infrastructure de Microsoft Fabric isole l'exécution des requêtes dans des environnements sécurisés, limitant ainsi la portée d'une éventuelle intrusion.
- **Retours d’Expérience via Red Teaming** : Des outils comme Microsoft PyRIT permettent d’évaluer la résistance de l’outil face aux attaques adverses, notamment en simulant des tentatives de jailbreak et en mesurant avec précision le taux de succès des attaques.

### Tests de Pénétration et Approches Hybrides

Les rapports de tests de pénétration indiquent que, même si l’outil fait face à des vecteurs non conventionnels d’attaque (notamment par le biais d'entrées malveillantes), la robustesse des mécanismes de validation et d'authentification demeure élevée. Par ailleurs, l’intégration d’approches hybrides associant la méthodologie MITRE ATT&CK et les principes Zero Trust permet de renforcer l’ensemble de la chaîne de sécurité.

Des indicateurs quantitatifs (par exemple, taux de pénétration réussi et scores d’impact de brèche) sont suivis en continu. Ces mesures permettent non seulement la validation proactive des protections actuelles, mais aussi l’identification précoce de failles potentielles nécessitant des patchs ou une reconfiguration rapide.

## Observabilité et Surveillance du Système

### Métriques et Indicateurs Clés

La capacité d’observer et de mesurer les actions au sein de l’outil Copilot est essentielle pour garantir une exploitation responsable et prévenir les usages détournés. Les indicateurs surveillés incluent :

- **Token Usage Metrics** : Permettent de suivre la consommation des ressources IA et de détecter des anomalies dans l’utilisation des prompts.
- **Latence et Temps de Réponse** : Les temps décomposés (tokenisation, génération et détokénisation) offrent des indicateurs sur la santé et la performance des processus en temps réel.
- **Qualité du Contenu Généré** : Les métriques relatives à la cohérence, la pertinence et la fluidité des réponses sont monitorées afin d’assurer un retour de qualité qui respecte à la fois les engagements utilisateurs et les standards éthiques.

### Outils de Monitoring et Limitations Avérées

L'observabilité de Copilot est réalisée à l'aide de multiples outils de surveillance et de diagnostic tels que :

- **Azure AI Foundry et Prompt Flow** : Ces plateformes permettent une visualisation en temps réel des flux de données, des requêtes émises et de leur traitement, fournissant ainsi une transparence totale pour des audits internes ou externes.
- **Azure Monitor et Diagnostic Settings** : L’utilisation de Kusto Query Language (KQL) sur les logs recueillis offre un suivi détaillé des requêtes HTTP, de l’usage des tokens et des éventuels incidents.

Malgré la robustesse de ces dispositifs, certains manques ont été identifiés :

- **Granularité des Logs** : Dans certaines situations, des données sensibles comme le contenu complet des tables sont exclues des logs, ce qui limite la capacité d’audit granulaire en cas de besoin forensique.
- **Détection d’Usages Détournés** : Bien que les systèmes d’alerte soient performants, il peut s’avérer difficile de distinguer certains comportements légitimes d’usages détournés sans intervention humaine supplémentaire ou analyse comportementale avancée.

Ces limitations suggèrent la nécessité d’un renforcement de l’intelligence artificielle appliquée aux logs (par exemple via des modèles de détection d’anomalies) pour améliorer la détection proactive d’usage abusif.

## Recommandations et Pistes d'Amélioration

1. **Renforcement de l’Audit Granulaire** : Intégrer des options permettant un logging plus détaillé (avec des mécanismes de masquage des données sensibles) pour une meilleure traçabilité, notamment lors d’incidents critiques.

2. **Optimisation de la Détection d'Anomalies** : Développer et intégrer des algorithmes IA dédiés à la détection comportementale sur les logs, permettant d'identifier en temps réel les schémas anormaux ou les tentatives d'usage détourné.

3. **Mise à Jour Continue des Tests de Sécurité** : Mettre en place un cycle continu de tests de pénétration et d’exercices red-team pour faire évoluer de manière dynamique les défenses contre les techniques de jailbreak et autres vecteurs d'attaques émergentes.

4. **Révision des Paramètres de Data Residency** : Revoir et affiner la configuration des capacités Multi-Geo et ADR afin d'assurer une flexibilité maximale tout en garantissant la conformité aux exigences mises à jour par les autorités européennes.

5. **Collaboration Interdisciplinaire** : Encourager des échanges réguliers entre les équipes de cybersécurité, les développeurs d’IA et les responsables de la conformité pour anticiper les évolutions réglementaires et technologiques, notamment en vue de l’émergence d'une réglementation précise dans le cadre de l’IA Act.

## Conclusion

Microsoft Copilot pour Power BI et la Power Platform représente une solution avancée d’analyse de données intégrant des fonctionnalités d’IA génératives pour optimiser la prise de décision. Les mécanismes de conformité – fondés sur le RGPD, DMCA, et les prémices de l’IA Act – combinés à des approches de sécurité sophistiquées (chiffrement avancé, contrôle d’accès granulaire et tests de pénétration réguliers) illustrent l’engagement de Microsoft envers la protection des données et la conformité réglementaire.

De plus, l’observabilité du système, bien que déjà robuste grâce à des outils comme Azure AI Foundry et Azure Monitor, présente des marges d’amélioration pour une détection encore plus précoce des usages détournés. En résumé, Microsoft adopte une approche holistique intégrant des mesures techniques, administratives et stratégiques pour garantir que Copilot reste sécurisé et conforme tout en permettant une exploitation efficace des données. 

Ce rapport, destiné aux analystes expérimentés, met en exergue la nécessité d'une vigilance constante et d'une adaptation continue face à un environnement réglementaire et technologique en perpétuelle évolution.

---

_Fin du rapport_

## Sources

- https://learn.microsoft.com/en-us/fabric/fundamentals/copilot-power-bi-privacy-security
- https://www.dpocentre.com/microsoft-copilot-privacy-compliance-tips/
- https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy
- https://learn.microsoft.com/en-us/power-bi/create-reports/copilot-introduction
- https://learn.microsoft.com/en-us/legal/cognitive-services/openai/data-privacy
- https://learn.microsoft.com/en-us/power-platform/faqs-copilot-data-security-privacy
- https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-ai-security
- https://officegarageitpro.medium.com/how-to-get-ready-for-copilot-for-microsoft-365-updates-for-2024-d9c0ae5592c0
- https://learn.microsoft.com/en-us/purview/ai-microsoft-purview
- https://www.ela.europa.eu/sites/default/files/2024-06/Copilot_record_public_version.pdf
- https://learn.microsoft.com/en-us/copilot/privacy-and-protections
- https://learn.microsoft.com/en-us/copilot/security/privacy-data-security
- https://learn.microsoft.com/en-us/power-bi/guidance/whitepaper-powerbi-security
- https://learn.microsoft.com/en-us/microsoft-365/enterprise/m365-dr-workload-copilot?view=o365-worldwide
- https://slmmicrosoftrijk.nl/wp-content/uploads/2024/12/20241218-Public-version-DPIA-Microsoft-365-Copilot-for-SLM-Rijk.pdf
- https://www.youtube.com/watch?v=sxWHiNLTwcU
- https://labs.zenity.io/p/rce
- https://cybersecuritynews.com/github-copilot-jailbreak-vulnerability/
- https://adversa.ai/blog/genai-security-top-digest-slack-and-apple-prompt-injections-threats-of-microsoft-copilot-image-attacks/
- https://github.com/MicrosoftDocs/powerbi-docs/blob/main/powerbi-docs/create-reports/copilot-create-report-service.md
- https://learn.microsoft.com/en-us/microsoft-cloud/dev/copilot/isv/observability-for-ai
- https://powerbi.microsoft.com/en-us/blog/introducing-microsoft-fabric-and-copilot-in-microsoft-power-bi/
- https://learn.microsoft.com/en-us/data-engineering/playbook/capabilities/data-observability/
- https://www.alifconsulting.com/post/microsoft-copilot-for-power-bi
- https://learn.microsoft.com/en-us/fabric/fundamentals/copilot-fabric-overview
- https://powerbi.microsoft.com/en-us/blog/copilot-in-microsoft-fabric-is-now-generally-available-in-the-power-bi-experience/
- https://blog.fabric.microsoft.com/en-us/blog/fabric-workloads-are-now-generally-available?ft=Data-activator:category
- https://azure.microsoft.com/en-us/blog/introducing-microsoft-fabric-data-analytics-for-the-era-of-ai/
- https://learn.microsoft.com/en-us/azure/ai-services/openai/how-to/monitor-openai
- https://azure.microsoft.com/en-us/solutions/ai/responsible-ai-with-azure
- https://techcommunity.microsoft.com/blog/educatordeveloperblog/how-to-use-azure-open-ai-to-enhance-your-data-analysis-in-power-bi/4041036
- https://github.com/kimtth/awesome-azure-openai-llm/blob/main/README_all_in_one.md