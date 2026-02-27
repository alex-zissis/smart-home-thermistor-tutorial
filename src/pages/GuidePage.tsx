import { useEffect, useState } from 'react';
import CodeBlock, { type CodeLanguage } from '../components/CodeBlock';
import { ConceptMappingContent } from '../components/GuideInfoContent';
import breadboardFromPdf from '../assets/section12-page115.png';
import blinkFromPdf from '../assets/section1-blink-page42.png';

type VisualType = 'ide' | 'blink' | 'breadboard' | 'serial';

type Step = {
  id: string;
  phase: string;
  title: string;
  summary: string;
  details: string[];
  visual?: VisualType;
};

type LearningNote = {
  concept: string;
  terms: string[];
  codeWalkthrough?: string;
};

type CodeCard = {
  id: string;
  title: string;
  objective: string;
  stub: string;
  doneWhen: string[];
  hints: string[];
};

const STORAGE_KEYS = {
  checklist: 'tutorial_checklist_v3',
  codeCards: 'tutorial_code_cards_v1',
  conceptSeen: 'tutorial_concept_seen_v1'
};

const STEPS: Step[] = [
  {
    id: 'install_ide',
    phase: 'Setup',
    title: 'Install Arduino IDE 2',
    summary: 'Start from zero: install Arduino IDE so you can upload code to the ESP32.',
    details: [
      'Download Arduino IDE 2 from arduino.cc/en/software and install it.',
      'Open Arduino IDE once after install so it creates its settings folders.',
      'Connect ESP32 with a data USB cable (some USB cables are charge-only and will not work).'
    ],
    visual: 'ide'
  },
  {
    id: 'add_esp32_board',
    phase: 'Setup',
    title: 'Add ESP32 Board Support',
    summary: 'Arduino IDE does not include ESP32 by default. Add the board package URL first.',
    details: [
      'Open Arduino IDE -> Settings (or Preferences on macOS).',
      'Find Additional boards manager URLs and paste the ESP32 URL from the snippet.',
      'Open Boards Manager, search ESP32, install Espressif Systems package.'
    ]
  },
  {
    id: 'blink_warmup',
    phase: 'Warmup',
    title: 'Sketch 1.1 Blink (Practice Run)',
    summary:
      'After ESP32 board support is installed, do one fast flash cycle with Blink to get comfortable with breadboard wiring and upload flow.',
    details: [
      'Wire the LED circuit exactly like the Freenove image from absolute page 42.',
      'Select board + port, then upload Blink to verify toolchain and cable/port setup.',
      'Expect a steady blink; this is your hardware/IDE sanity check before the main workshop sketch.'
    ],
    visual: 'blink'
  },
  {
    id: 'install_libraries',
    phase: 'Setup',
    title: 'Install Required Library (MQTT)',
    summary: 'Install PubSubClient so the sketch can publish sensor values over MQTT.',
    details: [
      'Open Library Manager (book icon on left).',
      'Search for PubSubClient by Nick OLeary and click Install.',
      'The WiFi library is included with the ESP32 board package, no extra install needed.'
    ]
  },
  {
    id: 'breadboard',
    phase: 'Hardware',
    title: 'Build the Breadboard Circuit',
    summary: 'Wire the thermistor voltage divider exactly as shown before uploading code.',
    details: [
      'Breadboard basics: each 5-hole row is connected horizontally; power rails run vertically.',
      'Voltage divider: 3.3V -> thermistor -> ADC node -> 10k resistor -> GND.',
      'Connect ADC node to ESP32 GPIO34 (PIN_ANALOG_IN = 34).',
      'Important override to the tutorial image: it shows GPIO4, but for this workshop you must move that wire to GPIO34.',
      'Reason: GPIO4 is ADC2 and can fail when WiFi is active.'
    ],
    visual: 'breadboard'
  },
  {
    id: 'mqtt_flash',
    phase: 'Firmware',
    title: 'Implement the Firmware (Functions + Loop)',
    summary: 'Set project constants, implement helper functions, and structure the main loop for periodic reporting.',
    details: [
      'Set WIFI_SSID and WIFI_PASSWORD to your local network.',
      'Set MQTT_BROKER, MQTT_PORT, and MQTT_TOPIC to your Mosquitto values.',
      'Implement setupWifi(), setupMqtt(), calculateTempC(), and report() based on step guidance.',
      'Ensure loop() runs mqtt.loop() every iteration and only reports every 10 seconds.',
      'Save and compile cleanly before moving to upload/verification.'
    ]
  },
  {
    id: 'first_upload',
    phase: 'Firmware',
    title: 'Upload Thermistor Sketch and Verify Serial Output',
    summary:
      'After wiring + implementation, upload the thermistor sketch and verify runtime logs in serial monitor at 115200 baud.',
    details: [
      'Tools -> Board -> ESP32 Arduino -> ESP32 Dev Module (or your exact board).',
      'Tools -> Port -> select the USB port for your ESP32.',
      'Click Upload, open Serial Monitor, and set baud to 115200 (must match Serial.begin(115200)).'
    ],
    visual: 'serial'
  },
  {
    id: 'services',
    phase: 'Backend',
    title: 'Start Mosquitto and Home Assistant',
    summary: 'Bring up broker + Home Assistant containers from your workshop compose file.',
    details: [
      'From workshop folder, start services using Docker Compose.',
      'Wait until both containers are running before testing messages.',
      'Your current compose uses host network mode, so broker should be reachable on LAN IP.'
    ]
  },
  {
    id: 'mqtt_test',
    phase: 'Backend',
    title: 'Confirm MQTT Messages Arrive',
    summary: 'Subscribe to your topic and verify values every publish interval.',
    details: [
      'Run mosquitto_sub with the same broker/port/topic used in the sketch.',
      'You should see values like 22.35 every ~10 seconds.',
      'If no messages: check ESP32 serial output and broker IP correctness.'
    ]
  },
  {
    id: 'ha_mqtt',
    phase: 'Home Assistant',
    title: 'Enable MQTT Integration in Home Assistant',
    summary: 'Link Home Assistant to the broker before creating entities.',
    details: [
      'In Home Assistant: Settings -> Devices & Services -> Add Integration -> MQTT.',
      'Enter broker host and port. Use auth only if broker requires credentials.',
      'After success, Home Assistant can subscribe to topic data.'
    ]
  },
  {
    id: 'ha_entity',
    phase: 'Home Assistant',
    title: 'Create Temperature Sensor Entity',
    summary: 'Add YAML for an MQTT sensor bound to your topic, then reload or restart HA.',
    details: [
      'Name and unique_id should stay stable so dashboards keep working.',
      'Use device_class temperature and state_class measurement for proper HA behavior.',
      'After reload, verify new entity appears under Developer Tools -> States.'
    ]
  },
  {
    id: 'dashboard',
    phase: 'Validation',
    title: 'Add Dashboard Card and Validate End to End',
    summary: 'Place the entity on a dashboard and test physical temperature changes.',
    details: [
      'Add Sensor or Gauge card for your MQTT entity.',
      'Touch or warm the thermistor and watch value change in Home Assistant.',
      'If stale values persist, verify topic string match and retained publish behavior.'
    ]
  }
];

const BOARD_MANAGER_SNIPPET = `Additional boards manager URLs:
https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json

Then install in Boards Manager:
ESP32 by Espressif Systems`;

const BLINK_WARMUP_SNIPPET = `// Warmup: simple blink (adapt LED pin to your page 42 wiring if needed)
const int LED_PIN = 4;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}`;

const LIBRARY_SNIPPET = `Arduino IDE -> Library Manager -> search:
PubSubClient (by Nick OLeary)

Required baud rate in this project:
115200`;

const SERIAL_SNIPPET = `Expected serial output (115200):
Setup start
Connecting to YOUR_WIFI_SSID
Connected, IP address:
192.168.x.x
Connecting to MQTT Broker 192.168.x.x:1883
Connected to MQTT
ADC value : 2060,  Voltage : 1.66V,  Temperature : 24.12C`;

const FUNCTION_CONTRACTS_SNIPPET = `// Provide implementations for these contracts (no starter implementation given):
void setupWifi();          // connect ESP32 to WiFi, retry until connected
void setupMqtt();          // connect MQTT client to broker, retry until connected
double calculateTempC();   // read ADC and return temperature in Celsius
void report(double tempC); // publish temperature payload to MQTT topic

// Hint: keep setup() and loop() thin, and delegate work to these helpers.`;

const FULL_FIRMWARE_TEMPLATE_SNIPPET = `#include <WiFi.h>
#include <PubSubClient.h>

#define PIN_ANALOG_IN 34

const char *WIFI_SSID = "YOUR_WIFI_SSID";
const char *WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const char *MQTT_BROKER = "192.168.x.x";
const int MQTT_PORT = 1883;
const char *MQTT_TOPIC = "home/workshop/temperature";

unsigned long lastSendMs = 0;

WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

void setup() {
  Serial.begin(115200);
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

  mqtt.loop(); // run every loop iteration

  if (millis() - lastSendMs < 10000) {
    return; // report every 10 seconds
  }

  lastSendMs = millis();
  report(calculateTempC());
}

void setupWifi() {
  // TODO: begin WiFi and block/retry until WL_CONNECTED
}

void setupMqtt() {
  // TODO: set server and block/retry until mqtt.connected() is true
}

double calculateTempC() {
  // TODO: paste/use the provided calculateTempC implementation from Card C
  return 0.0;
}

void report(double tempC) {
  // TODO: format payload and publish to MQTT_TOPIC (retain=true)
}`;

const CALCULATE_TEMP_C_SNIPPET = `double calculateTempC() {
  // Freenove section 12 constants (10k NTC thermistor, Beta 3950)
  const double R_FIXED = 10.0;   // kOhm fixed resistor
  const double R0 = 10.0;        // kOhm at 25C
  const double BETA = 3950.0;

  int adcValue = analogRead(PIN_ANALOG_IN);
  if (adcValue <= 0) {
    adcValue = 1;
  }
  if (adcValue >= 4095) {
    adcValue = 4094;
  }

  double voltage = (adcValue / 4095.0) * 3.3;
  double rt = R0 * voltage / (3.3 - voltage);
  double tempK = 1 / (1 / (273.15 + 25) + log(rt / R_FIXED) / BETA);
  double tempC = tempK - 273.15;

  Serial.printf("ADC value : %d,\\tVoltage : %.2fV, \\tTemperature : %.2fC\\n", adcValue, voltage, tempC);
  return tempC;
}`;

const CODE_CARDS: CodeCard[] = [
  {
    id: 'setup_wifi',
    title: 'Card A: write setupWifi()',
    objective: 'Connect ESP32 to WiFi and block until connected.',
    stub: `void setupWifi() {
  // TODO: call WiFi.begin(WIFI_SSID, WIFI_PASSWORD)
  // TODO: loop until WiFi.status() == WL_CONNECTED
  // TODO: print local IP when connected
}`,
    doneWhen: [
      'Sketch keeps retrying until WiFi connection succeeds.',
      'Serial monitor prints a connecting message and final IP address.',
      'loop() no longer repeatedly fails because WiFi never connected.'
    ],
    hints: [
      'Use WiFi.begin(...) once per reconnect attempt and poll WiFi.status().',
      'Add small delay inside retry loop so serial output remains readable.'
    ]
  },
  {
    id: 'setup_mqtt',
    title: 'Card B: write setupMqtt()',
    objective: 'Connect PubSubClient to broker and retry until connected.',
    stub: `void setupMqtt() {
  // TODO: mqtt.setServer(MQTT_BROKER, MQTT_PORT)
  // TODO: generate client ID
  // TODO: loop until mqtt.connect(...) returns true
}`,
    doneWhen: [
      'mqtt.connected() becomes true after boot.',
      'Serial monitor shows broker address and successful connection.',
      'Reconnection works if broker restarts.'
    ],
    hints: [
      'Call mqtt.setServer once before attempting connect.',
      'Unique client IDs prevent session collisions across multiple boards.'
    ]
  },
  {
    id: 'calculate_temp_c',
    title: 'Card C: use provided calculateTempC()',
    objective: 'Use this implementation to read ADC and convert thermistor voltage to Celsius.',
    stub: CALCULATE_TEMP_C_SNIPPET,
    doneWhen: [
      'Returned value is numeric and in plausible room range (about 15-35 C).',
      'Temperature changes when touching/warming thermistor.',
      'No divide-by-zero or NaN values in serial output.'
    ],
    hints: [
      'This is calibrated for Freenove section 12 parts (10k fixed resistor + Beta 3950 thermistor).',
      'If your readings look off, verify wiring and resistor values before changing the formula.'
    ]
  },
  {
    id: 'report',
    title: 'Card D: write report(tempC)',
    objective: 'Format temperature and publish it to MQTT topic.',
    stub: `void report(double tempC) {
  // TODO: format payload text (e.g. 24.12)
  // TODO: call mqtt.publish(MQTT_TOPIC, payload, true)
  // TODO: print topic and payload to serial
}`,
    doneWhen: [
      'Payload appears on mosquitto_sub with expected decimal format.',
      'Topic matches Home Assistant sensor state_topic exactly.',
      'Retained message survives subscriber reconnect.'
    ],
    hints: [
      'Use snprintf into a fixed-size char buffer.',
      'Keep report() only about publish/logging; calculate temp elsewhere.'
    ]
  }
];

const INSTRUCTOR_NOTES: Record<string, string[]> = {
  install_ide: [
    'Have participants confirm they can open IDE before connecting hardware.',
    'Keep one known-good USB data cable at the front for quick cable swap testing.'
  ],
  blink_warmup: [
    'Run this as a hard checkpoint before moving to thermistor + MQTT complexity.',
    'If Blink fails, stop and fix board/port/wiring basics first.'
  ],
  add_esp32_board: [
    'Common issue: URL pasted with trailing spaces or missing https.',
    'If installation fails, ask them to restart IDE and re-open Boards Manager.'
  ],
  install_libraries: [
    'Students often install similarly named libraries by mistake; verify exact library author.',
    'If compile fails on PubSubClient include, re-open Library Manager and check installed version.'
  ],
  breadboard: [
    'Have students point to the ADC node physically before connecting jumper to GPIO34.',
    'Most wiring errors are power rail mistakes; check rails first, then component rows.'
  ],
  first_upload: [
    'If upload stalls, hold BOOT button on ESP32 during upload start.',
    'Wrong serial port selection is the top first-hour blocker in workshops.'
  ],
  mqtt_flash: [
    'Validate broker IP on projector and have everyone paste from a shared source.',
    'Encourage topic naming convention by table/group to avoid collisions in shared LAN.'
  ],
  services: [
    'Run services before firmware troubleshooting to avoid false negatives.',
    'If one container fails, use logs command in diagnostics panel below.'
  ],
  mqtt_test: [
    'Ask students to read one live payload aloud to confirm end-to-end path.',
    'If payload is retained and stale, power cycle sensor and compare timestamp behavior.'
  ],
  ha_mqtt: [
    'If broker auth is disabled in workshop, explicitly call that out as LAN-only for safety.',
    'Keep one pre-configured HA instance as fallback demo for stuck participants.'
  ],
  ha_entity: [
    'Unique_id must stay stable; changing it creates duplicate entities in HA.',
    'Use Developer Tools -> States to validate raw entity state before dashboard card setup.'
  ],
  dashboard: [
    'Have students gently pinch thermistor between fingers for visible temperature rise.',
    'Close with a short recap on data path: sensor -> ESP32 -> MQTT -> Home Assistant.'
  ]
};

const LEARNING_NOTES: Record<string, LearningNote> = {
  install_ide: {
    concept:
      'Treat ESP32 like a tiny edge runtime: Arduino IDE is your editor + build + flash pipeline for that target device.',
    terms: ['ESP32: hardware target', 'Arduino IDE: local build + deploy tool', 'USB data cable: physical deploy channel']
  },
  blink_warmup: {
    concept:
      'Blink is the firmware equivalent of a smoke test: quick proof that build, flash, and hardware wiring are all functional.',
    terms: ['Smoke test: minimal success check', 'Digital output: HIGH/LOW pin state', 'Flash cycle: edit -> upload -> verify']
  },
  add_esp32_board: {
    concept:
      'Board support is like installing a target-specific toolchain. Without it, your code cannot compile for ESP32.',
    terms: ['Board package: target toolchain + metadata', 'Board Manager: target installer', 'Port: selected deployment device']
  },
  install_libraries: {
    concept:
      'Arduino libraries are dependencies. PubSubClient is equivalent to adding an MQTT client package in other ecosystems.',
    terms: ['Library: dependency', '#include: compile-time import', 'MQTT client: network abstraction']
  },
  breadboard: {
    concept:
      'Breadboard wiring is your hardware graph. Wrong connection means runtime bug before firmware even starts.',
    terms: ['Rail: shared power bus', 'Node: equivalent to a shared variable', 'Voltage divider: analog signal conditioner']
  },
  first_upload: {
    concept: 'Upload is build + deploy. Serial Monitor is your live log stream from the board process.',
    terms: ['Compile: target binary build', 'Flash: deploy binary to device memory', 'Baud rate: serial link configuration']
  },
  mqtt_flash: {
    concept:
      'Think of setup() as bootstrapping main() and loop() as a single-threaded scheduler tick running forever.',
    terms: [
      'setup(): startup lifecycle hook',
      'loop(): long-running event loop',
      'helper contracts: behavior spec without implementation'
    ]
  },
  services: {
    concept: 'Mosquitto is your message bus; Home Assistant is a consuming app with entity/state modeling on top.',
    terms: ['Broker: pub/sub router', 'Container: isolated service runtime', 'docker compose: local orchestration']
  },
  mqtt_test: {
    concept: 'Use pub/sub probes like integration tests: one producer, one consumer, fixed channel.',
    terms: ['Publish: emit event payload', 'Subscribe: consume event stream', 'Topic: routing key']
  },
  ha_mqtt: {
    concept: 'Home Assistant integration is a connector config that binds your broker to HA entity state updates.',
    terms: ['Integration: connector plugin', 'Entity: typed domain object', 'State: current persisted value']
  },
  ha_entity: {
    concept: 'YAML here acts like declarative schema: identity + metadata controls how HA interprets your stream.',
    terms: ['YAML: declarative config', 'unique_id: immutable primary key', 'device_class: semantic type hint']
  },
  dashboard: {
    concept: 'Dashboard is the final read model. A changing card confirms full pipeline health from ADC read to UI render.',
    terms: ['Card: UI projection of state', 'End-to-end: full data path check', 'Retained message: last-known event snapshot']
  }
};

function loadFromStorage<T extends Record<string, unknown>>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return { ...fallback, ...(JSON.parse(raw) as Partial<T>) };
  } catch {
    return fallback;
  }
}

function hasSeenConceptMapping(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.conceptSeen) === '1';
  } catch {
    return false;
  }
}

function sanitizeViewMode(value: string | null): 'accordion' | 'focus' {
  return value === 'accordion' ? 'accordion' : 'focus';
}

function sanitizeStepId(value: string | null): string {
  return STEPS.some((step) => step.id === value) ? (value as string) : STEPS[0].id;
}

function readGuideRouteState() {
  const params = new URLSearchParams(window.location.search);
  return {
    mode: sanitizeViewMode(params.get('mode')),
    stepId: sanitizeStepId(params.get('step'))
  };
}

function writeGuideRouteState(mode: 'accordion' | 'focus', stepId: string, replace = true) {
  const url = new URL(window.location.href);
  url.searchParams.set('mode', sanitizeViewMode(mode));
  url.searchParams.set('step', sanitizeStepId(stepId));
  const nextUrl = `${url.pathname}?${url.searchParams.toString()}${url.hash}`;
  if (replace) {
    window.history.replaceState(null, '', nextUrl);
    return;
  }
  window.history.pushState(null, '', nextUrl);
}

function IdeFlowVisual() {
  return (
    <figure className="mini-visual" aria-label="Arduino IDE setup flow">
      <div className="flow-grid">
        <div className="flow-node">1. Install Arduino IDE</div>
        <div className="flow-arrow">{'->'}</div>
        <div className="flow-node">2. Add ESP32 boards URL</div>
        <div className="flow-arrow">{'->'}</div>
        <div className="flow-node">3. Install ESP32 package</div>
        <div className="flow-arrow">{'->'}</div>
        <div className="flow-node">4. Install PubSubClient</div>
      </div>
    </figure>
  );
}

function SerialMonitorVisual() {
  return (
    <figure className="mini-visual" aria-label="Serial monitor preview">
      <div className="terminal-window">
        <div className="terminal-title">Serial Monitor (115200 baud)</div>
        <div className="terminal-body">
          <p>Setup start</p>
          <p>Connected, IP address: 192.168.1.77</p>
          <p>Connected to MQTT</p>
          <p>ADC value : 2060, Voltage : 1.66V, Temperature : 24.12C</p>
        </div>
      </div>
    </figure>
  );
}

function BlinkVisual() {
  return (
    <figure className="mini-visual" aria-label="Blink circuit from Freenove tutorial absolute page 42">
      <img src={blinkFromPdf} alt="Freenove tutorial absolute page 42 LED blink circuit wiring" />
      <figcaption>Reference: Freenove C Tutorial absolute PDF page 42 (Sketch 1.1 Blink).</figcaption>
    </figure>
  );
}

function BreadboardVisual() {
  return (
    <figure className="mini-visual" aria-label="Breadboard circuit from Freenove tutorial page 115">
      <img src={breadboardFromPdf} alt="Freenove tutorial page 115 breadboard circuit for thermistor temperature sensor" />
      <div className="pin-warning">
        <strong>Important:</strong> the source image shows thermistor input on <code>GPIO4</code>. In this
        workshop, use <code>GPIO34</code> instead.
      </div>
      <figcaption>Reference: Freenove C Tutorial, section 12 thermistor circuit (page 115).</figcaption>
    </figure>
  );
}

function StepVisual({ type }: { type: VisualType }) {
  if (type === 'blink') {
    return <BlinkVisual />;
  }
  if (type === 'breadboard') {
    return <BreadboardVisual />;
  }
  if (type === 'ide') {
    return <IdeFlowVisual />;
  }
  if (type === 'serial') {
    return <SerialMonitorVisual />;
  }
  return null;
}

type CodeCardsInlineProps = {
  codeCards: Record<string, boolean>;
  onToggleCodeCard: (cardId: string) => void;
  onResetCodeCards: () => void;
};

function CodeCardsInline({ codeCards, onToggleCodeCard, onResetCodeCards }: CodeCardsInlineProps) {
  const completedCards = Object.values(codeCards).filter(Boolean).length;
  const cardsProgress = Math.round((completedCards / CODE_CARDS.length) * 100);

  return (
    <section className="code-cards-inline">
      <div className="section-head">
        <h4>Coding Cards: Fill Function Stubs</h4>
        <button type="button" className="ghost-btn" onClick={onResetCodeCards}>
          Reset
        </button>
      </div>
      <p>Implement these in your sketch now, before moving to broker/Home Assistant steps.</p>
      <div className="progress-row" aria-label="coding card progress">
        <span>
          Coding cards complete: {completedCards}/{CODE_CARDS.length}
        </span>
        <strong>{cardsProgress}%</strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${cardsProgress}%` }} />
      </div>

      <div className="code-card-grid">
        {CODE_CARDS.map((card) => (
          <article key={card.id} className={`code-challenge-card ${codeCards[card.id] ? 'done' : ''}`}>
            <h3>{card.title}</h3>
            <p>{card.objective}</p>
            <CodeBlock code={card.stub} language="cpp" />
            <h4>Done When</h4>
            <ul>
              {card.doneWhen.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <details className="hint-details">
              <summary>Hints</summary>
              <ul>
                {card.hints.map((hint) => (
                  <li key={hint}>{hint}</li>
                ))}
              </ul>
            </details>
            <label className="complete-row">
              <input
                type="checkbox"
                checked={Boolean(codeCards[card.id])}
                onChange={() => onToggleCodeCard(card.id)}
              />
              <span>Card completed</span>
            </label>
          </article>
        ))}
      </div>
    </section>
  );
}

type StepContentProps = {
  step: Step;
  snippet?: string;
  snippetLanguage?: CodeLanguage;
  isDone: boolean;
  onToggleDone: () => void;
  completeVariant?: 'default' | 'prominent';
  showCompletionControl?: boolean;
  instructorMode: boolean;
  instructorNotes?: string[];
  learningNote?: LearningNote;
  codeCards: Record<string, boolean>;
  onToggleCodeCard: (cardId: string) => void;
  onResetCodeCards: () => void;
};

function StepContent({
  step,
  snippet,
  snippetLanguage = 'plaintext',
  isDone,
  onToggleDone,
  completeVariant = 'default',
  showCompletionControl = true,
  instructorMode,
  instructorNotes,
  learningNote,
  codeCards,
  onToggleCodeCard,
  onResetCodeCards
}: StepContentProps) {
  return (
    <>
      <p>{step.summary}</p>
      <ul>
        {step.details.map((detail) => (
          <li key={detail}>{detail}</li>
        ))}
      </ul>
      {learningNote ? (
        <aside className="learn-note">
          <h4>Learn This Step</h4>
          <p>{learningNote.concept}</p>
          <ul>
            {learningNote.terms.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
          {learningNote.codeWalkthrough ? <CodeBlock code={learningNote.codeWalkthrough} language="cpp" /> : null}
        </aside>
      ) : null}
      {instructorMode && instructorNotes?.length ? (
        <aside className="instructor-note">
          <h4>Instructor Notes</h4>
          <ul>
            {instructorNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </aside>
      ) : null}
      {step.visual ? <StepVisual type={step.visual} /> : null}
      {snippet ? <CodeBlock code={snippet} language={snippetLanguage} /> : null}
      {step.id === 'mqtt_flash' ? (
        <CodeCardsInline
          codeCards={codeCards}
          onToggleCodeCard={onToggleCodeCard}
          onResetCodeCards={onResetCodeCards}
        />
      ) : null}
      {showCompletionControl ? (
        <label className={`complete-row ${completeVariant === 'prominent' ? 'complete-row-prominent' : ''}`}>
          <input type="checkbox" checked={isDone} onChange={onToggleDone} />
          <span>Mark this step complete</span>
        </label>
      ) : null}
    </>
  );
}

export default function GuidePage() {
  const routeState = readGuideRouteState();
  const isFirstConceptRun = !hasSeenConceptMapping();
  const initialChecklist = Object.fromEntries(STEPS.map((step) => [step.id, false]));
  const initialCodeCards = Object.fromEntries(CODE_CARDS.map((card) => [card.id, false]));

  const [checklist, setChecklist] = useState<Record<string, boolean>>(() =>
    loadFromStorage(STORAGE_KEYS.checklist, initialChecklist)
  );
  const [codeCards, setCodeCards] = useState<Record<string, boolean>>(() =>
    loadFromStorage(STORAGE_KEYS.codeCards, initialCodeCards)
  );
  const [viewMode, setViewMode] = useState<'accordion' | 'focus'>(routeState.mode);
  const [activeStepId, setActiveStepId] = useState(routeState.stepId);
  const [needsConceptContinue, setNeedsConceptContinue] = useState(isFirstConceptRun);
  const showIntroCards = needsConceptContinue;

  const instructorMode = new URLSearchParams(window.location.search).get('debug') === '1';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.checklist, JSON.stringify(checklist));
  }, [checklist]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.codeCards, JSON.stringify(codeCards));
  }, [codeCards]);

  useEffect(() => {
    writeGuideRouteState(viewMode, activeStepId, true);
  }, [viewMode, activeStepId]);

  useEffect(() => {
    function onPopState() {
      const route = readGuideRouteState();
      setViewMode(route.mode);
      setActiveStepId(route.stepId);
    }

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const completed = Object.values(checklist).filter(Boolean).length;
  const progress = Math.round((completed / STEPS.length) * 100);

  const activeIndex = Math.max(
    0,
    STEPS.findIndex((step) => step.id === activeStepId)
  );
  const activeStep = STEPS[activeIndex];

  const stepSnippets: Record<string, string> = {
    blink_warmup: BLINK_WARMUP_SNIPPET,
    add_esp32_board: BOARD_MANAGER_SNIPPET,
    install_libraries: LIBRARY_SNIPPET,
    first_upload: SERIAL_SNIPPET,
    mqtt_flash: FULL_FIRMWARE_TEMPLATE_SNIPPET
  };

  const stepSnippetLanguages: Record<string, CodeLanguage> = {
    blink_warmup: 'cpp',
    add_esp32_board: 'plaintext',
    install_libraries: 'plaintext',
    first_upload: 'plaintext',
    mqtt_flash: 'cpp'
  };

  function setStepByIndex(index: number) {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, index));
    setActiveStepId(STEPS[clamped].id);
  }

  function goNext() {
    setStepByIndex(activeIndex + 1);
  }

  function goNextWithAutoComplete() {
    const currentStepId = STEPS[activeIndex].id;
    setChecklist((prev) => {
      if (prev[currentStepId]) {
        return prev;
      }
      return { ...prev, [currentStepId]: true };
    });
    setStepByIndex(activeIndex + 1);
  }

  function goPrevious() {
    setStepByIndex(activeIndex - 1);
  }

  function toggleDone(stepId: string, shouldAdvance = false) {
    setChecklist((prev) => {
      const nextValue = !prev[stepId];
      if (shouldAdvance && nextValue && activeIndex < STEPS.length - 1) {
        window.setTimeout(goNext, 0);
      }
      return { ...prev, [stepId]: nextValue };
    });
  }

  function toggleCodeCard(cardId: string) {
    setCodeCards((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  }

  function resetChecklist() {
    setChecklist(initialChecklist);
  }

  function resetCodeCards() {
    setCodeCards(initialCodeCards);
  }

  function continueFromConceptMapping() {
    try {
      localStorage.setItem(STORAGE_KEYS.conceptSeen, '1');
    } catch {
      // Ignore storage errors and continue workshop flow.
    }
    window.dispatchEvent(
      new CustomEvent('workshop:conceptSeenChanged', {
        detail: { showHint: true }
      })
    );
    setNeedsConceptContinue(false);
    window.setTimeout(() => {
      document.getElementById('guided-steps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  useEffect(() => {
    if (viewMode !== 'focus') {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowRight') {
        goNext();
      }
      if (event.key === 'ArrowLeft') {
        goPrevious();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, viewMode]);

  if (showIntroCards) {
    return (
      <section className="card glossary-card stagger-1">
        <h2>Concept Mapping for Software Devs</h2>
        <ConceptMappingContent />
        <div className="guide-accordion-actions">
          <button type="button" className="mode-btn active" onClick={continueFromConceptMapping}>
            Continue to Guide
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="guided-steps" className="card stagger-1">
      <div className="section-head">
        <h2>Guided Steps (Embedded Onramp)</h2>
        <button type="button" className="ghost-btn" onClick={resetChecklist}>
          Reset
        </button>
      </div>

      <div className="progress-row" aria-label="guided step progress">
        <span>
          Progress: {completed}/{STEPS.length} steps complete
        </span>
        <strong>{progress}%</strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="mode-switch" role="tablist" aria-label="step view mode">
        <button
          type="button"
          className={`mode-btn ${viewMode === 'accordion' ? 'active' : ''}`}
          onClick={() => setViewMode('accordion')}
        >
          Accordion Mode
        </button>
        <button
          type="button"
          className={`mode-btn ${viewMode === 'focus' ? 'active' : ''}`}
          onClick={() => setViewMode('focus')}
        >
          Focus Mode
        </button>
        {instructorMode ? <span className="debug-chip">Instructor Mode (`debug=1`)</span> : null}
      </div>

      {viewMode === 'accordion' ? (
        <div className="step-list">
          {STEPS.map((step, index) => {
            const isOpen = step.id === activeStepId;
            const isDone = Boolean(checklist[step.id]);
            return (
              <article key={step.id} className={`step-card ${isOpen ? 'open' : ''} ${isDone ? 'done' : ''}`}>
                <button
                  type="button"
                  className="step-trigger"
                  onClick={() => setActiveStepId(step.id)}
                  aria-expanded={isOpen}
                >
                  <span className="step-count">Step {index + 1}</span>
                  <span className="step-title">{step.title}</span>
                  <span className="step-phase">{step.phase}</span>
                </button>

                {isOpen ? (
                  <div className="step-panel">
                    <StepContent
                      step={step}
                      snippet={stepSnippets[step.id]}
                      snippetLanguage={stepSnippetLanguages[step.id]}
                      isDone={isDone}
                      onToggleDone={() => toggleDone(step.id)}
                      completeVariant="prominent"
                      instructorMode={instructorMode}
                      instructorNotes={INSTRUCTOR_NOTES[step.id]}
                      learningNote={LEARNING_NOTES[step.id]}
                      codeCards={codeCards}
                      onToggleCodeCard={toggleCodeCard}
                      onResetCodeCards={resetCodeCards}
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <article className="focus-stage">
          <header>
            <span className="step-count">
              Step {activeIndex + 1}/{STEPS.length}
            </span>
            <h3>{activeStep.title}</h3>
            <span className="step-phase">{activeStep.phase}</span>
          </header>

          <div className="focus-body">
            <StepContent
              step={activeStep}
              snippet={stepSnippets[activeStep.id]}
              snippetLanguage={stepSnippetLanguages[activeStep.id]}
              isDone={Boolean(checklist[activeStep.id])}
              onToggleDone={() => toggleDone(activeStep.id, true)}
              showCompletionControl={false}
              instructorMode={instructorMode}
              instructorNotes={INSTRUCTOR_NOTES[activeStep.id]}
              learningNote={LEARNING_NOTES[activeStep.id]}
              codeCards={codeCards}
              onToggleCodeCard={toggleCodeCard}
              onResetCodeCards={resetCodeCards}
            />
          </div>

          <footer className="focus-nav">
            <button type="button" className="nav-btn" onClick={goPrevious} disabled={activeIndex === 0}>
              Previous
            </button>
            <button
              type="button"
              className="nav-btn primary-btn"
              onClick={goNextWithAutoComplete}
              disabled={activeIndex === STEPS.length - 1}
            >
              Next
            </button>
          </footer>
        </article>
      )}
    </section>
  );
}
