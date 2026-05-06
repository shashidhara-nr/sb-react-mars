// mockNonTransactionalAuthRules.ts
export interface NonTransactionalAuthRuleRow {
  id: string;
  predefinedAuthRule: string;
  predefinedAuthRuleDescription: string;
  authorisationClass:
    | 'authorisation class 1'
    | 'authorisation class 2'
    | 'authorisation class 3'
    | 'authorisation class 4'
    | 'authorisation class 5';
  links: { href: string; text: string };
}

export const mockNonTransactionalAuthRules: NonTransactionalAuthRuleRow[] = [
  {
    id: '1',
    predefinedAuthRule: 'User Account Management',
    predefinedAuthRuleDescription: 'Authorization rules for creating, modifying, and deleting user accounts within the system',
    authorisationClass: 'authorisation class 1',
    links: { href: '/setup-and-admin/non-transactional/manage', text: 'MANAGE AUTHORISATION RULE' },
  },
  {
    id: '2',
    predefinedAuthRule: 'Beneficiary Setup',
    predefinedAuthRuleDescription: 'Rules governing the creation and modification of beneficiary information and bank details',
    authorisationClass: 'authorisation class 2',
    links: { href: '/setup-and-admin/non-transactional/manage', text: 'MANAGE AUTHORISATION RULE' },
  },
  {
    id: '3',
    predefinedAuthRule: 'Payment Template Configuration',
    predefinedAuthRuleDescription: 'Authorization framework for setting up and editing payment templates and recurring payment schedules',
    authorisationClass: 'authorisation class 1',
    links: { href: '/setup-and-admin/non-transactional/manage', text: 'MANAGE AUTHORISATION RULE' },
  },
  {
    id: '4',
    predefinedAuthRule: 'System Configuration Changes',
    predefinedAuthRuleDescription: 'Rules for modifying system settings, preferences, and organizational configuration parameters',
    authorisationClass: 'authorisation class 3',
    links: { href: '/setup-and-admin/non-transactional/manage', text: 'MANAGE AUTHORISATION RULE' },
  },
  {
    id: '5',
    predefinedAuthRule: 'Access Rights Management',
    predefinedAuthRuleDescription: 'Authorization rules for assigning and revoking user permissions and access levels across the platform',
    authorisationClass: 'authorisation class 2',
    links: { href: '/setup-and-admin/non-transactional/manage', text: 'MANAGE AUTHORISATION RULE' },
  },
  {
    id: '6',
    predefinedAuthRule: 'Bulk Upload Operations',
    predefinedAuthRuleDescription: 'Rules governing the authorization of bulk file uploads for payments, beneficiaries, and account data',
    authorisationClass: 'authorisation class 4',
    links: { href: '/setup-and-admin/non-transactional/manage', text: 'MANAGE AUTHORISATION RULE' },
  },
  {
    id: '7',
    predefinedAuthRule: 'Report Generation Setup',
    predefinedAuthRuleDescription: 'Authorization framework for creating custom reports and configuring automated report schedules',
    authorisationClass: 'authorisation class 1',
    links: { href: '/setup-and-admin/non-transactional/manage', text: 'MANAGE AUTHORISATION RULE' },
  },
  {
    id: '8',
    predefinedAuthRule: 'Account Linking Configuration',
    predefinedAuthRuleDescription: 'Rules for linking and unlinking external bank accounts and third-party financial institutions',
    authorisationClass: 'authorisation class 5',
    links: { href: '/setup-and-admin/non-transactional/manage', text: 'MANAGE AUTHORISATION RULE' },
  },
  {
    id: '9',
    predefinedAuthRule: 'Notification Preference Updates',
    predefinedAuthRuleDescription: 'Authorization rules for modifying email, SMS, and system notification preferences for users',
    authorisationClass: 'authorisation class 3',
    links: { href: '/setup-and-admin/non-transactional/manage', text: 'MANAGE AUTHORISATION RULE' },
  },
  {
    id: '10',
    predefinedAuthRule: 'Security Policy Management',
    predefinedAuthRuleDescription: 'Rules governing changes to security policies, authentication methods, and compliance settings',
    authorisationClass: 'authorisation class 4',
    links: { href: '/setup-and-admin/non-transactional/manage', text: 'MANAGE AUTHORISATION RULE' },
  },
];
