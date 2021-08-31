import { PERMISSIONS } from "../data/numberTypes";
import { Bitfield, Flags, PermissionName } from "../data/types"; 

export default class PermissionUtils {
    static has(bitfield: Bitfield | Flags, permission: PermissionName) {
        const numberBitfield = BigInt(bitfield);
        const permissionFlag = BigInt(PERMISSIONS[permission]);

        return (numberBitfield & permissionFlag) ? true : false;
    }

    static hasAll(bitfield: Bitfield | Flags, permissions: PermissionName[]) {
        const numberBitfield = BigInt(bitfield);
        for (const permission of permissions) {
            const permissionFlag = BigInt(PERMISSIONS[permission]);
            if (!(numberBitfield & permissionFlag)) {
                return false;
            }
        }
        return true;
    }

    static hasSome(bitfield: Bitfield | Flags, permissions: PermissionName[]) {
        const numberBitfield = BigInt(bitfield);
        for (const permission of permissions) {
            const permissionFlag = BigInt(PERMISSIONS[permission]);
            if (numberBitfield & permissionFlag) {
                return true;
            }
        }
        return false;
    }
}