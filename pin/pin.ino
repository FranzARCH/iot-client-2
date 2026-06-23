const int PIR_PIN = 19;

void setup() {
  Serial.begin(115200);

  pinMode(PIR_PIN, INPUT);

  Serial.println("PIR listo en GPIO19");
}

void loop() {

  int estado = digitalRead(PIR_PIN);

  if (estado == HIGH) {
    Serial.println("1");
  }
  else Serial.println("0");

  delay(200);
}