export const injectTenantScope = (query, tenantId) => {
  return { ...query, tenantId };
};
