# Changelog

## 0.4.5 (2020-17-03)
- Updated dependencies

## 0.4.4 (2019-23-10)
- Bugfix for Nullpointer.

## 0.4.3 (2019-13-10)
- Bugfix for Nullpointer. Thanks to SebKranz (https://github.com/RandomMetalhead/homebridge-teufel/issues/11)

## 0.4.2 (2019-09-06)
- Bugfix for Nullpointer in config

## 0.4.1 (2019-08-30)
- Zones based on rooms instead of devices
- New 'clearcache' config-option to delete old devices cache and create new devices
- BETA! New 'frozen' config-option to prevent deleting devices


## 0.3.5 (2019-04-29)
- New dependencies
- No logger error on startup

## 0.3.4 (2018-12-22)
- Virtual Zone should always start now

## 0.3.3 (2018-12-21)
- Fixed Virtual Zone Switch
- Updated Raumfeld server

## 0.2.8 (2018-07-23)
- Still trying to get deletion of devices right

## 0.2.0 (2018-05-08)
- Fixed Nullpointer

## 0.1.6 (2018-04-19)
- Not readding devices when they have spaces in their name

## 0.1.4 (2018-04-17)
- Fixed some NullPointer and better error handling

## 0.1.3 (2018-04-07)
- Correctly deleting speakers which do not exist anymore or have changed names

## 0.1.1 (2018-04-03)
- Speaker-Switches now put speakers to stand-by directly
- Switching on speakers will add them to the currently playing "Virtual Zone" automatically

## 0.0.5 (2018-03-15)
- "Virtual Zone"-Switch working
- Updated console.log to homebridge-log-system
- Bugfix Nullpointer

## 0.0.2 (2018-03-08)
- added elementree as dependency in package.json

## 0.0.1 (2018-03-08)
- initial release with minimal functionality and many bugs
