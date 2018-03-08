# Raumfeld and Teufel plugin for Homebridge

This is a plugin to connect Raumfeld/Teufel hardware to Apple's Homekit via the Homebridge system.

## Currently a prototype
This is also my first node.JS project.
Please visit [homebridge github homepage](https://github.com/nfarina/homebridge) first.

### Prerequisites
This plugin requires at least one running Raumfeld/Teufel device in order to work.
This plugin needs unqiue names for your Raumfeld/Teufel devices.

### Installation
First see link above and follow the installation instruction for Homebridge. Afterwards, simply install this plugin (assuming that homebridge is installed globally): `sudo npm install -g homebridge-teufel`. 
Now copy the `config-sample.json`to your homebridge home folder (usually `/home/username/.homebridge`) and rename it to `config.json`.
Finally, you can the setup with `homebridge`.

Homebridge should show your devices and one switch called "Virtual Zone". Currently I assume, that there is only one Zone playing music.
Will work on that in the future.

### Features
Currently, only play/pause are supported.
