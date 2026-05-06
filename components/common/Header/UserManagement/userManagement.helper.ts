export const passwordRules = [
  {
    id: 'length',
    label: 'Password must be 8–14 characters long',
    test: (pwd: string) => pwd.length >= 8 && pwd.length <= 14,
  },
  {
    id: 'uppercase',
    label: 'Must include at least one uppercase letter',
    test: (pwd: string) => /[A-Z]/.test(pwd),
  },
  {
    id: 'lowercase',
    label: 'Must include at least one lowercase letter',
    test: (pwd: string) => /[a-z]/.test(pwd),
  },
  {
    id: 'number',
    label: 'Must include at least one number',
    test: (pwd: string) => /\d/.test(pwd),
  },
  {
    id: 'noSpaces',
    label: 'No spaces allowed',
    test: (pwd: string) => !/\s/.test(pwd),
  },
  {
    id: 'history',
    label: 'Cannot be the same as your last 12 passwords',
    test: (_pwd: string) => true, // ✅ placeholder (backend validation)
  },
];
``