export const usersCol = "users";
export const tokensCol = "tokens";
export const sensorsCol = "sensors";
export const devicesCol = "devices";
export const apiKeysCol = "apiKeys";
export const inviteCodesCol = "invite-codes";
export const organisationsCol = "organisations";


export type IDeviceType = typeof sensorsCol;


export const apiTokenAccessLevels = {
    0: "00", // No Access
    1: "01", // Read Only
    2: "02", // Upload Only
    3: "03", // Read + Upload
    4: "04", // Admin
}

export const apiTokenRetentionLevels = {
    "free": "0007",
    "hobby": "0030",
    "essential": "0090",
    "pro": "0180",
    "enterprise": "0365",
}

export const apiTokenAccessLevelsName = {
    0: "No Access",
    1: "Read Only",
    2: "Upload Only",
    3: "Read + Upload",
    4: "Admin",
}


export const memberLimits = {
    "free": 5,
    "hobby": 3,
    "essential": 10,
    "pro": 50,
    "enterprise": -1,
}

export const sensorLimits = {
    "free": 2,
    "hobby": 5,
    "essential": 20,
    "pro": 100,
    "enterprise": 1000,
}


export const tokensCookieKey = "tokens";
export const sensorsCookieKey = "sensors";
export const organisationCookieKey = "organisation";

export const cookieList = [
    tokensCookieKey,
    sensorsCookieKey,
    organisationCookieKey
]


export const levelOneAccess = ["viewer", "developer", "admin", "owner"];
export const levelTwoAccess = ["developer", "admin", "owner"];
export const levelThreeAccess = ["admin", "owner"];
export const levelFourAccess = ["owner"];