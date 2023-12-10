radio.onReceivedNumber(function (receivedNumber) {
    funkzeit_ms = input.runningTime()
    if (bit.getBit(receivedNumber, 24)) {
        oled.comment("fährt, alle i2c Anzeigen nicht aktualisieren um Zeit zu sparen")
        Calli2bot.fahreJoystick(receivedNumber, true, true)
    } else {
        oled.comment("fährt nicht")
        OLEDtext.writeText8x16(1, 0, 7, bit.formatNumber(receivedNumber, bit.eLength.HEX_FFFFFFFF))
        Calli2bot.setRgbLed3(0x0000ff)
        i2cSchleife()
    }
})
function funkTimeout () {
    Calli2bot.i2cRESET_OUTPUTS()
    OLEDtext.writeText8x16(1, 0, 7, oled.oled_text("TIMEOUT"))
    Calli2bot.setRgbLed3(0xff0000, true, true, true, true, true)
}
input.onButtonEvent(Button.B, input.buttonEventClick(), function () {
    while (Calli2bot.seite9Linienfolger(100, 50, 10)) {
    	
    }
})
function i2cSchleife () {
    Calli2bot.setLed1(calli2bot.eLed.poweron, true, true, 1)
    alle2Sekunden()
}
function alle2Sekunden () {
    if (input.runningTime() - laufzeit_ms > 2000) {
        laufzeit_ms = input.runningTime()
        OLEDtext.writeText8x16(13, 0, 7, "" + Math.round(laufzeit_ms / 1000) + " " + "s", oled.eAlign.rechts)
        OLEDtext.writeText8x16(14, 0, 7, wattmeter.statuszeile(wattmeter.wattmeter_eADDR(wattmeter.eADDR.Watt_x45), wattmeter.eStatuszeile.v), oled.eAlign.rechts)
        OLEDtext.writeText8x16(15, 0, 7, wattmeter.statuszeile(wattmeter.wattmeter_eADDR(wattmeter.eADDR.Watt_x45), wattmeter.eStatuszeile.mA), oled.eAlign.rechts)
        if (Calli2bot.geti2cError() == -1010 && bit.between(input.runningTime(), 11000, 20000)) {
            oled.comment("wenn CalliBot 0x22 beim Start nicht angeschaltet war")
            control.reset()
        }
    }
}
let laufzeit_ms = 0
let funkzeit_ms = 0
let Calli2bot: calli2bot.Calli2bot = null
let OLEDtext: oled.oledclass = null
OLEDtext = oled.new_oledclass(oled.oled_eADDR_OLED(oled.eADDR_OLED.OLED_16x8_x3C), false, true)
wattmeter.reset(wattmeter.wattmeter_eADDR(wattmeter.eADDR.Watt_x45))
Calli2bot = calli2bot.beimStart(calli2bot.calli2bot_eADDR(calli2bot.eADDR.CB2_x22))
OLEDtext.set_eeprom_8x8(oled.oled_eEEPROM_Startadresse(oled.eEEPROM_Startadresse.F000))
OLEDtext.writeText8x16(0, 0, 7, "TYP " + Calli2bot.i2cReadFW_VERSION(calli2bot.eVersion.Typ))
radio.setFrequencyBand(1)
radio.setGroup(222)
basic.forever(function () {
    if (OLEDtext.geti2cError_OLED() != 0) {
        oled.comment("im Simulator kein Programm abarbeiten")
        basic.setLedColor(0xff0000)
    } else if (funkzeit_ms == 0) {
        oled.comment("dauerhaft nur, wenn keine Daten über Bluetooth empfangen werden")
        i2cSchleife()
    } else if (input.runningTime() - funkzeit_ms > 1500) {
        oled.comment("Timeout, wenn länger als 1,5s keine Daten über Bluetooth empfangen werden")
        funkTimeout()
    }
})
