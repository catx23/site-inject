export const supported = {
    "view": {
        "viewId": "string",
        "type": "string",
        "time": "number",
        "url": "string",
        "isIframe": "boolean",
        "tabId": "string"
    },
    "click": {
        "viewId": "string",
        "type": "string",
        "time": "number",
        "x": "number",
        "y": "number",
        "targetId": "number"
    },
    "move": {
        "viewId": "string",
        "type": "string",
        "time": "number",
        "x": "number",
        "y": "number",
        "targetId": "number"
    },
    "resize": {
        "viewId": "string",
        "type": "string",
        "time": "number",
        "width": "number",
        "height": "number"
    },
    "scroll": {
        "viewId": "string",
        "type": "string",
        "time": "number",
        "top": "number",
        "left": "number",
        "targetId": "number"
    },
    "input": {
        "viewId": "string",
        "type": "string",
        "time": "number",
        "value": "string",
        "caret": "number",
        "removals": "number",
        "targetId": "number"
    }
}
const isOptionalField = (type, field) => {
    if(type === 'move' && field === 'viewId' ){
        return false;
    }
    return true;
}