export interface User {
    _id?: string;
    username?: string;
    authenticationHash?: string;
    roleId?: string;
    nickname?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    token?: string;

    roleName?: string;
}