# Raumfeld and Teufel plugin for Homebridge

This is a plugin to connect Raumfeld/Teufel hardware to Apple's Homekit via the Homebridge system.

## Currently a prototype
This is also my first node.JS project. It is a plugin for [homebridge](https://github.com/nfarina/homebridge).
You need a running homebridge in order to use this plugin.

### Prerequisites
This plugin requires at least one running Raumfeld/Teufel device in order to work.
This plugin needs unique names for your Raumfeld/Teufel devices and rooms.

### Installation
First see link above and follow the installation instruction for Homebridge. Afterwards, simply install this plugin (assuming that homebridge is installed globally): `sudo npm install -g homebridge-teufel`. 
Now copy the `config-sample.json` to your homebridge home folder (usually `/home/username/.homebridge`) and rename it to `config.json`.
Finally, you can the setup with `homebridge`.

Homebridge should show your devices and one switch called "Virtual Zone". Currently I assume, that there is only one Zone playing music.
Will work on that in the future.

### HowTo
**Start only selected devices with Homekit scene (e.g. Arriving home):**
- Create a new Homekit scene
- Add Raumfeld/Teufel devices you want to start **AND** the "Virtual Zone"-device
- Activate all devices in the scene and save
Now only the devices in the scene will start playing (for example, when you arrive at home).

**Sleeping or good morning timer:**
- Create a new automation in Homekit (for example by time or by sunrise)
- Add Raumfeld/Teufel devices **AND** the "Virtual Zone"-device
- Activate all devices in the scene
- Now you can choose "deactivate after XX minutes" for the automation and save
Now you devices will start playing on the set automation and will stop playing after the defined time.
