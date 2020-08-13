import { supported } from './types'
export const ok = {
    "move": {
        "time": 1533821663816,
        "type": "move",
        "targetId": 56,
        "x": 486,
        "y": 435
    }
}
export const bad = {
    "move": {
        "time2": 1533821663816,
        "type": "move",
        "targetId": 56,
        "x": 486,
        "y": 435
    }
}
export const mock_ok = (type) => ok[type];

export const check_type = (type, field, value) => {
    const signature = supported[type];
    if (!signature) {
        return false;
    }
    return typeof value === signature[field];
}

export const check_payload = (payload) => {
    // no payload, or payload.type not supported
    if(!payload || !payload.type || !supported[payload.type]){
        return false;
    }
    // all payload fields match the type
    for (let field in payload) {
        if(!check_type(payload.type,field, payload[field])){
            return false;
        }
    }
    return true;
}