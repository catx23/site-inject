const proxyquire = require("proxyquireify")(require);
// const mock = require('./data');
import { bad, mock_ok, ok, check_type, check_payload } from './data';
import { supported } from './types';
const coreAPI = {
    now: () => Date.now(),
    createLightweightBeacon: jasmine.createSpy("createLightweightBeacon"),
    getBeaconProtocol: jasmine.createSpy("getBeaconProtocol"),
    sendSpecificBeacon: jasmine.createSpy("sendSpecificBeacon"),
    addBeaconProtocolSendListener: jasmine.createSpy("addBeaconProtocolSendListener")
    //send: jasmine.createSpy("send")
};
/*
const timport = (mid) => {
    const { mid } = proxyquire("./index", {
        "../platform/core": coreAPI
    });
    return mid;
}*/

fdescribe("transmitter", function () {
    beforeEach(function () {
        jasmine.clock().mockDate();
    });

    afterEach(function () {
        jasmine.clock().uninstall();
    });

    xdescribe("send", function () {
        xit("send data by light weight beacons", function () {
            const { send, initTransmitter } = proxyquire("./index", {
                "../platform/core": coreAPI
            });
            //const addData = jasmine.createSpy("addData");
            //coreAPI.getBeaconProtocol.and.returnValue({ a: addData });
            initTransmitter();
            //expect(coreAPI.addBeaconProtocolSendListener).toHaveBeenCalled();
            const t = send("dom", "_payload", 1);

            //console.log('test ', mock_true('move'));

            const ok_move = mock_ok('move');
            for (let field in ok_move) {
                //console.log('check field ' + field, ok_move[field], check_type("move", field, ok_move[field]))
            }

            //console.log('keys a', Object.keys(ok_move).sort());
            //console.log('keys b', Object.keys(supported['move']).sort());
            // console.log('match ',  .every(e =>Object.keys(ok_move).includes(e)));
            const left = Object.keys(supported['move']);
            const right = Object.keys(ok_move);
            const diff = left.filter(e => !right.find(a => e == a));
            
        });
    });

});
