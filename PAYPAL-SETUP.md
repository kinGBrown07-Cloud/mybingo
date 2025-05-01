# Configuration de PayPal pour Bingoo

## Prérequis
1. Un compte développeur PayPal (créez-en un sur [developer.paypal.com](https://developer.paypal.com) si vous n'en avez pas)
2. Une application PayPal créée dans votre compte développeur

## Étapes de configuration

### 1. Créer un fichier `.env.local`
Créez un fichier nommé `.env.local` à la racine de votre projet avec le contenu suivant :

```
# Configuration PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=votre_client_id_paypal
PAYPAL_SECRET=votre_secret_paypal

# Base de données et autres variables d'environnement
DATABASE_URL=votre_url_de_base_de_données
DIRECT_URL=votre_url_direct_de_base_de_données
```

### 2. Obtenir vos identifiants PayPal
1. Connectez-vous à [developer.paypal.com](https://developer.paypal.com)
2. Allez dans "My Apps & Credentials"
3. Sélectionnez votre application ou créez-en une nouvelle
4. Copiez le "Client ID" et le "Secret" dans votre fichier `.env.local`

### 3. Mode Sandbox vs Production
- Pour les tests, utilisez les identifiants du mode Sandbox
- Pour la production, utilisez les identifiants du mode Live

### 4. Régénérer le client Prisma
Après avoir configuré les variables d'environnement, exécutez la commande suivante pour mettre à jour le client Prisma avec les nouveaux types de transaction :

```bash
npx prisma generate
```

### 5. Redémarrer le serveur
Redémarrez votre serveur de développement pour que les modifications prennent effet :

```bash
npm run dev
```

## Dépannage

### Erreur "NEXT_PUBLIC_PAYPAL_CLIENT_ID n'est pas défini"
Vérifiez que :
1. Le fichier `.env.local` est correctement créé à la racine du projet
2. La variable `NEXT_PUBLIC_PAYPAL_CLIENT_ID` est correctement définie
3. Le serveur a été redémarré après la création du fichier

### Erreur "Transaction X non trouvée"
Cela peut se produire si :
1. La base de données n'est pas correctement configurée
2. Les migrations Prisma n'ont pas été appliquées
3. Le client Prisma n'a pas été régénéré après les modifications du schéma

Exécutez les commandes suivantes :
```bash
npx prisma migrate dev
npx prisma generate
```

### Erreur "PayPal n'est pas correctement configuré"
Vérifiez que :
1. Vous avez bien copié le bon Client ID depuis le dashboard développeur PayPal
2. Le Client ID correspond au mode que vous utilisez (Sandbox ou Live)
