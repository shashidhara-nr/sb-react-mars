module.exports = {
  // Removed 'stylelint-config-prettier' because Stylelint v16 dropped stylistic rules.
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'color-hex-length': 'short',
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'local'],
      },
    ],
  },
};
