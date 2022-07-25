import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces';

export const META_ROLES = 'role-protected';

/**
 * Checks if the user role is authorized
 * @param args roles authorized for the EP
 * @returns Custom Decorator
 */
export const RoleProtected = (...args: ValidRoles[]) => {
  return SetMetadata(META_ROLES, args);
};
