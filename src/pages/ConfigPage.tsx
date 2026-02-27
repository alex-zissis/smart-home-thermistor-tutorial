import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import CodeBlock from '../components/CodeBlock';

const CONFIG_STORAGE_KEY = 'tutorial_config_v1';

type ConfigState = {
  wifiSsid: string;
  wifiPassword: string;
  brokerIp: string;
  brokerPort: string;
  topic: string;
  sensorName: string;
  deviceName: string;
  intervalSeconds: string;
};

const DEFAULT_CONFIG: ConfigState = {
  wifiSsid: 'YOUR_WIFI_SSID',
  wifiPassword: 'YOUR_WIFI_PASSWORD',
  brokerIp: '192.168.1.28',
  brokerPort: '1883',
  topic: 'home/workshop/temperature',
  sensorName: 'Workshop Temperature',
  deviceName: 'ESP32 Thermistor',
  intervalSeconds: '10'
};

function loadConfig(): ConfigState {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_CONFIG;
    }
    return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<ConfigState>) };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return slug || 'sensor';
}

export default function ConfigPage() {
  const [config, setConfig] = useState<ConfigState>(loadConfig);

  useEffect(() => {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const firmwareSnippet = useMemo(
    () => `const char *WIFI_SSID       = "${config.wifiSsid}";
const char *WIFI_PASSWORD   = "${config.wifiPassword}";

const char* MQTT_BROKER = "${config.brokerIp}";
const int   MQTT_PORT   = ${config.brokerPort};
const char* MQTT_TOPIC  = "${config.topic}";

// in loop(), publish every ${config.intervalSeconds} seconds
if (millis() - lastSendMs < ${Number(config.intervalSeconds) * 1000 || 10000}) {
  return;
}`,
    [config]
  );

  const sensorId = slugify(`${config.deviceName}_${config.sensorName}`);

  const homeAssistantYaml = useMemo(
    () => `mqtt:
  sensor:
    - name: "${config.sensorName}"
      unique_id: "${sensorId}"
      state_topic: "${config.topic}"
      unit_of_measurement: "C"
      device_class: temperature
      state_class: measurement
      device:
        name: "${config.deviceName}"
        identifiers:
          - "${slugify(config.deviceName)}"`,
    [config, sensorId]
  );

  const testCommands = useMemo(
    () => `docker compose up -d mosquitto homeassistant
mosquitto_sub -h ${config.brokerIp} -p ${config.brokerPort} -t ${config.topic} -v`,
    [config]
  );

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <section className="card stagger-2">
      <h2>Configuration Builder</h2>
      <p>Enter your local values once. Use the generated snippets in your sketch and Home Assistant config.</p>

      <div className="grid form-grid">
        <label>
          WiFi SSID
          <input name="wifiSsid" value={config.wifiSsid} onChange={handleInput} />
        </label>
        <label>
          WiFi Password
          <input name="wifiPassword" value={config.wifiPassword} onChange={handleInput} />
        </label>
        <label>
          MQTT Broker IP
          <input name="brokerIp" value={config.brokerIp} onChange={handleInput} />
        </label>
        <label>
          MQTT Port
          <input name="brokerPort" value={config.brokerPort} onChange={handleInput} />
        </label>
        <label>
          MQTT Topic
          <input name="topic" value={config.topic} onChange={handleInput} />
        </label>
        <label>
          Sensor Name
          <input name="sensorName" value={config.sensorName} onChange={handleInput} />
        </label>
        <label>
          Device Name
          <input name="deviceName" value={config.deviceName} onChange={handleInput} />
        </label>
        <label>
          Publish Interval (seconds)
          <input name="intervalSeconds" value={config.intervalSeconds} onChange={handleInput} />
        </label>
      </div>

      <h3>Sketch constants</h3>
      <CodeBlock code={firmwareSnippet} language="cpp" />

      <h3>Home Assistant YAML</h3>
      <CodeBlock code={homeAssistantYaml} language="yaml" />

      <h3>Local verification commands</h3>
      <CodeBlock code={testCommands} language="bash" />
    </section>
  );
}
