import { User } from '../Users/user.model';

export class Session {
    id?: string ;
    token?: string ;
    expiration?: Date ;
    code2FA?: string ;
    type?: string ;
    attempts?: number ;
    active?: boolean ;
    user?: User;
}
