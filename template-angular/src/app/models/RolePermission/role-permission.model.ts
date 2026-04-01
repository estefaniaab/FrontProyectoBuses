import { Role } from '../Roles/role.model';

export class RolePermission {
  id?: string;
  role_id: Role[];
  permission_id: number;
}
