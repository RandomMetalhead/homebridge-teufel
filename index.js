'use strict';

var RaumkernelLib = require('node-raumkernel');

var Accessory, Service, Characteristic, UUIDGen;

module.exports = function (homebridge) {
    console.log("homebridge API version: " + homebridge.version);

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

        self.raumkernel.on("rendererStateKeyValueChanged", function (mediaRenderer, key, oldValue, newValue) {
            self.getSwitchState(mediaRenderer, key, oldValue, newValue)
        });

    }.bind(this));
}

TeufelPlatform.prototype.addAccessory = function (accessoryName, deviceUdn) {
    var uuid = UUIDGen.generate(accessoryName);
    var newAccessory = new Accessory(accessoryName, uuid);

    this.addSwitchService(newAccessory);

    newAccessory.context.name = accessoryName
    newAccessory.context.deviceUdn = deviceUdn;

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
    this.getSwitchService(accessory);
    this.accessories.push(accessory);
}


TeufelPlatform.prototype.addSwitchService = function (accessory) {
    var self = this;
    accessory.on('identify', function (paired, callback) {
        console.log(accessory, "Identify!!!");
        callback();
    });

    accessory.reachable = true;

    accessory.addService(Service.Switch)
        .getCharacteristic(Characteristic.On)
        .on('set', function (value, callback) {
            console.log(accessory.displayName, "Teufel Device -> " + value);
            callback();
            self.changeRaumfeldState(accessory, value)
        });
}

TeufelPlatform.prototype.getSwitchService = function (accessory) {
    var self = this;
    accessory.on('identify', function (paired, callback) {
        console.log("identify " + accessory.displayName + " - is paired: " + paired);
        callback();
    });

    accessory.reachable = true;

    // TODO: maybe add if for addservice if getService null?
    if (accessory.getService(Service.Switch)) {
        accessory.getService(Service.Switch)
            .getCharacteristic(Characteristic.On)
            .on('set', function (value, callback) {
                console.log(accessory.displayName, "Teufel Device -> " + value);
                callback();
                self.changeRaumfeldState(accessory, value)
            });
    }
}

TeufelPlatform.prototype.getSwitchState = function (mediaRenderer, key, oldValue, newValue) {
    var self = this;

    if (key === "TransportState") {
        switch (newValue) {
            case "STOPPED":
                console.log("Play stopped");
                return false;
                break;
            case "PLAYING":
                console.log("Play started");
                return true;
                break;
            default:
                console.log("unknown command")
        }
    }
}

TeufelPlatform.prototype.changeRaumfeldState = function (accessory, state) {
    var zoneId = accessory.context.deviceUdn;
    var name = accessory.displayName;
    this.log("Changing state of " + name + " and zoneId " + zoneId + " to " + state);
    var self = this;
    var mediaRenderer = self.raumkernel.managerDisposer.deviceManager.getVirtualMediaRenderer(accessory.context.deviceUdn);

    if (state) {
        mediaRenderer.play().then(function (_data) {
            console.log("Start playing")
        });
    } else {
        mediaRenderer.stop().then(function (_data) {
            console.log("Stop playing")
        });
    }
}

TeufelPlatform.prototype.setSwitch = function (accessory, state) {
    accessory.getService(Service.Switch).getCharacteristic(Characteristic.On).setValue(state, undefined);
}


TeufelPlatform.prototype.removeAccessory = function () {
    this.log("Remove Accessory");
    this.api.unregisterPlatformAccessories("homebridge-teufel", "Teufel", this.accessories);
    this.accessories = [];
}
