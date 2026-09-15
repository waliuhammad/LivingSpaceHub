export const ROLE_LABELS = {
  admin: 'Administrator',
  manager: 'Store Manager',
  support: 'Support Agent',
  customer: 'Customer',
};

export const STAFF_ROLES = ['admin', 'manager', 'support'];

// Keep in sync with the helper functions in firestore.rules.
export const can = {
  accessAdmin: (role) => STAFF_ROLES.includes(role),
  manageCatalog: (role) => role === 'admin' || role === 'manager',
  manageOrders: (role) => STAFF_ROLES.includes(role),
  viewTransactions: (role) => role === 'admin' || role === 'manager',
  viewCustomers: (role) => role === 'admin' || role === 'manager',
  blockCustomers: (role) => role === 'admin',
  manageCoupons: (role) => role === 'admin' || role === 'manager',
  moderateReviews: (role) => STAFF_ROLES.includes(role),
  manageSettings: (role) => role === 'admin',
  manageContent: (role) => role === 'admin',
  manageTeam: (role) => role === 'admin',
  deleteOrders: (role) => role === 'admin',
};
