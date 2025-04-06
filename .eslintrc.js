module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // Désactiver les règles qui posent problème
    '@typescript-eslint/no-unnecessary-type-constraint': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prefer-const': 'off',
  }
};
