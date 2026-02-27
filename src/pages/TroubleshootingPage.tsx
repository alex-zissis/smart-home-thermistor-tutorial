import CodeBlock from '../components/CodeBlock';

const INSTRUCTOR_DIAGNOSTICS = `# Docker service status
docker compose ps

# Container logs
docker compose logs --tail=80 mosquitto
docker compose logs --tail=80 homeassistant

# Check MQTT publish path manually
mosquitto_pub -h 192.168.1.28 -p 1883 -t home/workshop/temperature -m 23.5 -r`;

export default function TroubleshootingPage() {
  const instructorMode = new URLSearchParams(window.location.search).get('debug') === '1';

  return (
    <section className="card stagger-4 tips">
      <h2>Troubleshooting</h2>
      <ul>
        <li>If board is not detected, try a different USB cable (data-capable), then reconnect.</li>
        <li>If upload fails, verify board type and serial port in Arduino IDE Tools menu.</li>
        <li>If no MQTT messages appear, verify broker IP and ESP32 WiFi subnet match.</li>
        <li>If Home Assistant sensor is unavailable, confirm topic string matches exactly.</li>
        <li>If values jump wildly, check thermistor orientation and fixed resistor value (10k).</li>
      </ul>
      {instructorMode ? (
        <>
          <h3>Instructor Diagnostics</h3>
          <p>Use these commands during workshops to quickly isolate environment-level issues.</p>
          <CodeBlock code={INSTRUCTOR_DIAGNOSTICS} language="bash" />
        </>
      ) : null}
    </section>
  );
}
