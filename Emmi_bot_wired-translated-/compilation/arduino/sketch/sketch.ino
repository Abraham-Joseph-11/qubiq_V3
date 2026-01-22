#include "BluetoothSerial.h"
BluetoothSerial mySerialBT;

const int pinl = 13;
const int pinr = 14;
const int pinl1 = 27;
const int pinr2 = 26;


char receivedText = '/0';

void setup() {
  mySerialBT.begin("emmijaipur");

  pinMode(pinl, OUTPUT);
pinMode(pinr, OUTPUT);
pinMode(pinl1, OUTPUT);
pinMode(pinr2, OUTPUT);

  pinMode(32, OUTPUT);
  pinMode(33, OUTPUT);
  pinMode(25, OUTPUT);
  ledcSetup(4,5000,8);
ledcAttachPin(19,4);

  pinMode(39, INPUT);
  pinMode(17, INPUT);
    digitalWrite(32, HIGH);
  digitalWrite(33, HIGH);
  digitalWrite(25, HIGH);

}

void loop() {
    if (mySerialBT.available()) {
      receivedText = (mySerialBT.read());
    }
    if ('b' == receivedText) {
      digitalWrite(25, HIGH);
      digitalWrite(32, LOW);
      digitalWrite(33, HIGH);
    }
    if ('g' == receivedText) {
      digitalWrite(32, HIGH);
      digitalWrite(33, HIGH);
      digitalWrite(25, LOW);
    }
    if ('r' == receivedText) {
      digitalWrite(33, LOW);
      digitalWrite(32, HIGH);
      digitalWrite(25, HIGH);
    }
    if ('F' == receivedText) {
      digitalWrite(pinl, HIGH);
      digitalWrite(pinr, LOW);
      digitalWrite(pinl1, LOW);
      digitalWrite(pinr2, HIGH);
    }
    if ('R' == receivedText) {
      digitalWrite(pinl, LOW);
      digitalWrite(pinr, HIGH);
      digitalWrite(pinl1, LOW);
      digitalWrite(pinr2, HIGH);
    }
    if ('L' == receivedText) {
      digitalWrite(pinl, HIGH);
      digitalWrite(pinr, LOW);
      digitalWrite(pinl1, HIGH);
      digitalWrite(pinr2, LOW);
    }
    if ('B' == receivedText) {
      digitalWrite(pinl, LOW);
      digitalWrite(pinr, HIGH);
      digitalWrite(pinl1, HIGH);
      digitalWrite(pinr2, LOW);
    }
    if ('S' == receivedText) {
      digitalWrite(pinl, LOW);
      digitalWrite(pinr, LOW);
      digitalWrite(pinl1, LOW);
      digitalWrite(pinr2, LOW);
    }
    if ('m' == receivedText) {
      ledcWriteTone(4, 659 );
       delay(125);
      delay(2*1000);
      ledcWriteTone(4,0);
    }
    if ('D' == receivedText) {
      digitalWrite(25, HIGH);
      digitalWrite(32, LOW);
      digitalWrite(33, HIGH);
      digitalWrite(pinl, HIGH);
      digitalWrite(pinr, LOW);
      digitalWrite(pinl1, LOW);
      digitalWrite(pinr2, HIGH);
      delay(1*1000);
      digitalWrite(pinl, LOW);
      digitalWrite(pinr, HIGH);
      digitalWrite(pinl1, HIGH);
      digitalWrite(pinr2, LOW);
      delay(1*1000);
      digitalWrite(pinl, LOW);
      digitalWrite(pinr, LOW);
      digitalWrite(pinl1, LOW);
      digitalWrite(pinr2, LOW);
    }
    if ('Q' == receivedText) {
      digitalWrite(25, LOW);
      digitalWrite(32, HIGH);
      digitalWrite(33, HIGH);
      digitalWrite(pinl, HIGH);
      digitalWrite(pinr, LOW);
      digitalWrite(pinl1, HIGH);
      digitalWrite(pinr2, LOW);
      delay(1*1000);
      digitalWrite(pinl, LOW);
      digitalWrite(pinr, HIGH);
      digitalWrite(pinl1, LOW);
      digitalWrite(pinr2, HIGH);
      delay(1*1000);
      digitalWrite(pinl, LOW);
      digitalWrite(pinr, LOW);
      digitalWrite(pinl1, LOW);
      digitalWrite(pinr2, LOW);
    }
    if ('W' == receivedText) {
      digitalWrite(25, LOW);
      digitalWrite(32, LOW);
      digitalWrite(33, LOW);
      digitalWrite(pinl, LOW);
      digitalWrite(pinr, HIGH);
      digitalWrite(pinl1, HIGH);
      digitalWrite(pinr2, LOW);
      delay(1*1000);
      digitalWrite(pinl, HIGH);
      digitalWrite(pinr, LOW);
      digitalWrite(pinl1, HIGH);
      digitalWrite(pinr2, LOW);
      delay(1*1000);
      digitalWrite(pinl, HIGH);
      digitalWrite(pinr, LOW);
      digitalWrite(pinl1, LOW);
      digitalWrite(pinr2, HIGH);
      delay(1*1000);
      digitalWrite(pinl, LOW);
      digitalWrite(pinr, LOW);
      digitalWrite(pinl1, LOW);
      digitalWrite(pinr2, LOW);
    }
    if (digitalRead(39)) {
      mySerialBT.println("t");
      digitalWrite(32, HIGH);
      digitalWrite(25, HIGH);
      digitalWrite(33, HIGH);
    }
    if (digitalRead(17) == 0) {
      mySerialBT.println("m");
      digitalWrite(32, LOW);
      digitalWrite(25, LOW);
      digitalWrite(33, LOW);
      ledcWriteTone(4,440);
       delay(125);
      delay(1*1000);
      ledcWriteTone(4,0);
      delay(1*1000);
    }
    if (analogRead(35) < 500) {
      digitalWrite(32, HIGH);
      digitalWrite(25, LOW);
      digitalWrite(33, HIGH);
      digitalWrite(pinl, HIGH);
      digitalWrite(pinr, LOW);
      digitalWrite(pinl1, LOW);
      digitalWrite(pinr2, HIGH);
      ledcWriteTone(4,261);
       delay(125);
      delay(2*1000);
      digitalWrite(pinl, LOW);
      digitalWrite(pinr, LOW);
      digitalWrite(pinl1, LOW);
      digitalWrite(pinr2, LOW);
      ledcWriteTone(4,0);
      delay(1*1000);
    }
    receivedText = ' ';

}