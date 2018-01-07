module.exports = {
 "parserOptions": {
    "ecmaVersion": 6,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    },
    "plugins": ["react"],
    "extends": ["eslint:recommended", "plugin:react/recommended"]
  },
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    mocha: true,
  },
  rules: {
    'no-console': 'off',
    //  'no-debugger': 'off'
    "indent": ['error', 2]
  },
};
