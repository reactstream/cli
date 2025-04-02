module.exports = {
    env: {
        node: true,
        es6: true
    },
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    rules: {
        // Add your specific rules here
        'no-unused-vars': 'warn',
        'no-console': 'off'
    }
};
