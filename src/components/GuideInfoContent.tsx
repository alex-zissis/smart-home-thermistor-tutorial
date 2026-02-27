import tutorialPdf from '../assets/C_Tutorial.pdf';
import completedSketch from '../assets/Sketch_12.1.Thermometer.ino?url';
import composeReference from '../assets/docker-compose.reference.yaml?url';

export function ConceptMappingContent() {
  return (
    <>
      <p>Use this as a translation layer from backend/web concepts into embedded + IoT workflow.</p>
      <div className="glossary-grid">
        <article>
          <h3>ESP32</h3>
          <p>Think deployment target: a small edge device running your compiled firmware.</p>
        </article>
        <article>
          <h3>Arduino IDE</h3>
          <p>Editor + build + flash toolchain in one app for microcontroller projects.</p>
        </article>
        <article>
          <h3>Breadboard</h3>
          <p>Hardware wiring sandbox. Incorrect connections behave like wiring-time runtime bugs.</p>
        </article>
        <article>
          <h3>setup() and loop()</h3>
          <p>`setup()` is startup/boot hook; `loop()` is the always-running single-threaded event loop.</p>
        </article>
        <article>
          <h3>MQTT</h3>
          <p>Pub/sub event bus with topic-based routing, optimized for lightweight clients.</p>
        </article>
        <article>
          <h3>Home Assistant</h3>
          <p>Consumer app that turns MQTT streams into entities, history, and dashboards.</p>
        </article>
      </div>
    </>
  );
}

export function ReferenceFilesContent() {
  return (
    <>
      <p>Use these assets during the workshop.</p>
      <ul>
        <li>
          <a href={tutorialPdf} target="_blank" rel="noreferrer">
            C_Tutorial.pdf
          </a>{' '}
          - full project walkthroughs and tutorial.
        </li>
        <li>
          <a href={completedSketch} target="_blank" rel="noreferrer">
            Sketch_12.1.Thermometer.ino
          </a>{' '}
          - completed reference implementation.
        </li>
        <li>
          <a href={composeReference} target="_blank" rel="noreferrer">
            docker-compose.reference.yaml
          </a>{' '}
          - Docker Compose reference for Mosquitto + Home Assistant services.
        </li>
      </ul>
    </>
  );
}
