/**********************************************************************
  Filename    : Temperature Sensor
  Description : Making a temperature sensor using a thermistor and MQTT.
  Auther      : Alex Zissis
  Modification: 2025-02-03
**********************************************************************/

#include <WiFi.h>
#include <PubSubClient.h>

#define PIN_ANALOG_IN 34

const char *WIFI_SSID       = "ssid";     // Enter the router name 
const char *WIFI_PASSWORD   = "password"; // Enter the router password 

const char* MQTT_BROKER = "192.168.1.28";  // Enter the MQTT Broker IP (your laptop)
const int   MQTT_PORT   = 1883;            // The port for the MQTT broker (default 1883)
const char* MQTT_TOPIC  = "example";       // Enter the topic to publish to

unsigned long lastSendMs = 0;

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

void setup() {
  Serial.begin(115200); // match our default baud rate
  delay(500);

  Serial.println("Setup start");
  setupWifi();
  setupMqtt();
  
  Serial.println("Setup End");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    setupWifi();
  }
  if (!mqtt.connected()) {
    setupMqtt();
  }
  mqtt.loop();

  // report once every 10 secs
  if (millis() - lastSendMs < 10000) {
    return;
  }
    
  lastSendMs = millis();
  double tempC = calculateTempC();
  report(tempC);
}

void report(double tempC) {
  char payload[16];
  snprintf(payload, sizeof(payload), "%.2f", tempC);

  Serial.printf("Publishing to topic \"%s\", with value: %s", MQTT_TOPIC, payload);

  mqtt.publish(MQTT_TOPIC, payload, true /*retain*/);
}

double calculateTempC() {
  // Constants like resistance used by temperature calculation
  const double R_FIXED = 10.0;   // kΩ
  const double R0      = 10.0;   // kΩ @ 25C
  const double BETA    = 3950.0;

  int adcValue = analogRead(PIN_ANALOG_IN);                       // read ADC pin 
  double voltage = (float)adcValue / 4095.0 * 3.3;                // calculate voltage 
  double Rt = R0 * voltage / (3.3 - voltage);                     // calculate resistance value of thermistor 
  double tempK = 1 / (1/(273.15 + 25) + log(Rt / R_FIXED)/BETA);  // calculate temperature (Kelvin) 
  double tempC = tempK - 273.15;                                  // calculate temperature (Celsius) 

  Serial.printf("ADC value : %d,\tVoltage : %.2fV, \tTemperature : %.2fC\n", adcValue, voltage, tempC);

  return tempC;
}

void setupWifi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.println(String("Connecting to ") + WIFI_SSID);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected, IP address:");
  Serial.println(WiFi.localIP());
}

void setupMqtt() {
  mqtt.setServer(MQTT_BROKER, MQTT_PORT);
  Serial.printf("Connecting to MQTT Broker %s:%d\n", MQTT_BROKER, MQTT_PORT);

  while (!mqtt.connected()) {
    String clientId = "esp32-sensor-" + String((uint32_t)ESP.getEfuseMac(), HEX);
    if (!mqtt.connect(clientId.c_str())) {
      delay(500);
      Serial.print(".");
    }
  }

  Serial.println("Connected to MQTT");
}
