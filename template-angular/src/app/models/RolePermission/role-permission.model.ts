import { Role } from '../Roles/role.model';
import { Permission } from '../Permissions/permission.model';

export class RolePermission {
  id?: string;
  role?: Role;
  permission?: Permission;
}
