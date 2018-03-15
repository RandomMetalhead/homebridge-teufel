'use strict';

var RaumkernelLib = require('node-raumkernel');

var Accessory, Service, Characteristic, UUIDGen;

module.exports = function (homebridge) {
    console.log("Starting Teufel device discovery");

    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    Accessory = homebridge.platformAccessory;
    UUIDGen = homebridge.hap.uuid;

    homebridge.registerPlatform("homebridge-teufel", "Teufel", TeufelPlatform, true);
}

function TeufelPlatform(log, config, api) {
    this.name = "Raumfeld Zone";
    this.config = config;
    this.accessories = [];
    this.api = api;
    this.log = log;
    this.raumkernel = new RaumkernelLib.Raumkernel();

    // Initializing Raumfeldkernel
    this.raumkernel.createLogger();
    this.raumkernel.init();

    var self = this;

    this.api.on('didFinishLaunching', function () {
        self.raumkernel.on("mediaRendererRaumfeldAdded", function (deviceUdn, device) {
            self.addAccessory(device.name(), deviceUdn);
        });

        self.raumkernel.on("mediaRendererRaumfeldVirtualAdded", function (deviceUdn, device) {
            //currently only one zone supported! Otherwise, UUID would change
            self.addAccessory("Virtual Zone", deviceUdn);
        });

        self.raumkernel.on("zoneConfigurationChanged", function (zoneConfiguration) {
            self.addAccessory("Virtual Zone", zoneConfiguration.zoneConfig.zones[0].zone[0].$.udn);
        });
    }.bind(this));
}

TeufelPlatform.prototype.addAccessory = function (accessoryName, deviceUdn) {
    var uuid = UUIDGen.generate(accessoryName);
    var newAccessory = new Accessory(accessoryName, uuid);

    this.addSwitchService(newAccessory);

    newAccessory.context.name = accessoryName
    newAccessory.context.deviceUdn = deviceUdn;

    console.log("Found Teufel device " + newAccessory.displayName + ", processing.");
    console.log("Please make sure, that all Teufel devices have unique names!");

    // If device already added, don´t add again. We rely on unique names here!
    var arrayLength = this.accessories.length;
    for (var i = 0; i < arrayLength; i++) {
        if (this.accessories[i].displayName === newAccessory.displayName) {
            if (newAccessory.displayName === "Virtual Zone") {
                console.log("Its not a new device, but a new virtual zone, updating udn to " + deviceUdn);
                this.accessories[i].context.deviceUdn = deviceUdn;
                return;
            } else {
                console.log("Teufel " + newAccessory.displayName + " device already added, skipping");
                return;
            }
        }
    }
    this.accessories.push(newAccessory);
    this.api.registerPlatformAccessories("homebridge-teufel", "Teufel", [newAccessory]);
}

TeufelPlatform.prototype.configureAccessory = function (accessory) {
    this.log(accessory.displayName, "Configure Accessory");
    this.addSwitchService(accessory);
    this.accessories.push(accessory);
}


TeufelPlatform.prototype.addSwitchService = function (accessory) {
    var self = this;
    accessory.on('identify', function (paired, callback) {
        console.log(accessory, "Identify!!!");
        callback();
    });

    accessory.reachable = true;

    if (accessory.getService(Service.Switch)) {
        accessory.getService(Service.Switch)
            .getCharacteristic(Characteristic.On)
            .on('get', function (callback) {
                if (callback) callback(null, self.getSwitchState(accessory));
            })
            .on('set', function (value, callback) {
                if (callback) callback(null, self.changeRaumfeldState(accessory, value));
            });
    } else {
        accessory.addService(Service.Switch)
            .getCharacteristic(Characteristic.On)
            .on('get', function (callback) {
                if (callback) callback(null, self.getSwitchState(accessory));
            })
            .on('set', function (value, callback) {
                if (callback) callback(null, self.changeRaumfeldState(accessory, value));
            });
    }
}

TeufelPlatform.prototype.getSwitchState = function (accessory) {
    var self = this;

    var zoneId = accessory.context.deviceUdn;
    var name = accessory.displayName;

    if (name === "Virtual Zone") {
        var virtualZoneConfigProvider = self.raumkernel.managerDisposer.deviceManager.getVirtualMediaRenderer(accessory.context.deviceUdn);
        virtualZoneConfigProvider.getTransportInfo().then(function(_data){
            if (_data.CurrentTransportState !== 'PLAYING') {
                accessory.getService(Service.Switch).getCharacteristic(Characteristic.On).setValue(0);
            } else {
                accessory.getService(Service.Switch).getCharacteristic(Characteristic.On).setValue(1);
            }
        });
    } else {
        var zoneConfigProvider = self.raumkernel.managerDisposer.zoneManager.zoneConfiguration;
        var zoneJson = zoneConfigProvider.zoneConfig.zones[0].zone[0];

        for (var i = 0; i < zoneJson.room.length; i++) {
            if (zoneJson.room[i].renderer[0].$.udn === zoneId) {
                var powerstate = zoneJson.room[i].$.powerState;
                if (powerstate !== 'ACTIVE') {
                    return false;
                } else {
                    return true;
                }
            }
        }
    }
}

TeufelPlatform.prototype.changeRaumfeldState = function (accessory, state) {
    var self = this;

    var zoneId = accessory.context.deviceUdn;
    var name = accessory.displayName;
    var mediaRenderer = self.raumkernel.managerDisposer.deviceManager.getVirtualMediaRenderer(accessory.context.deviceUdn);

    this.log("Changing state of " + name + " and zoneId " + zoneId + " to " + state);

    if (state) {
        mediaRenderer.play().then(function (_data) {
            console.log("Start playing: " + _data)

        });
    } else {
        // TODO: do not stop playing, but send device to standby to preserve running virtual zone
        mediaRenderer.stop().then(function (_data) {
            console.log("Stop playing: " + _data)
        });
    }
}

TeufelPlatform.prototype.removeAccessory = function () {
    this.log("Remove Accessory");
    this.api.unregisterPlatformAccessories("homebridge-teufel", "Teufel", this.accessories);
    this.accessories = [];
}
