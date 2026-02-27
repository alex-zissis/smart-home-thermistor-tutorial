import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ConceptMappingContent, ReferenceFilesContent } from './components/GuideInfoContent';

function GuideIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h16v14H4z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 9h8M8 12h8M8 15h5" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ConfigIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="7" r="2.2" fill="currentColor" />
      <circle cx="15" cy="12" r="2.2" fill="currentColor" />
      <circle cx="11" cy="17" r="2.2" fill="currentColor" />
    </svg>
  );
}

function MathIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 12h4M16 12h4M12 4v4M12 16v4" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function TroubleshootingIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l9 16H3z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 9v4M12 16h.01" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ConceptIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h10a2 2 0 0 1 2 2v12H5V6a2 2 0 0 1 2-2z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M9 8h6M9 11h6M9 14h4" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function FilesIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 5h7l3 3v11H7z" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 5v3h3M9 12h6M9 15h6" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export default function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [showSidebarNudge, setShowSidebarNudge] = useState(false);

  useEffect(() => {
    function syncConceptState(event?: Event) {
      if (event instanceof CustomEvent && event.detail?.showHint) {
        setShowSidebarNudge(true);
      }
    }

    window.addEventListener('workshop:conceptSeenChanged', syncConceptState);
    return () => {
      window.removeEventListener('workshop:conceptSeenChanged', syncConceptState);
    };
  }, []);

  useEffect(() => {
    if (!showSidebarNudge) {
      return;
    }
    const timer = window.setTimeout(() => setShowSidebarNudge(false), 7000);
    return () => window.clearTimeout(timer);
  }, [showSidebarNudge]);

  return (
    <div className="app-layout">
      <aside className="sidebar" aria-label="Workshop page navigation">
        <nav className="sidebar-nav">
          <Link className={`sidebar-link ${pathname === '/' ? 'active' : ''}`} to="/" aria-label="Guided Steps">
            <GuideIcon />
            <span className="sidebar-tooltip">Guided Steps</span>
          </Link>
          <Link
            className={`sidebar-link ${pathname === '/config' ? 'active' : ''}`}
            to="/config"
            aria-label="Config Builder"
          >
            <ConfigIcon />
            <span className="sidebar-tooltip">Config Builder</span>
          </Link>
          <Link className={`sidebar-link ${pathname === '/math' ? 'active' : ''}`} to="/math" aria-label="Math Sandbox">
            <MathIcon />
            <span className="sidebar-tooltip">Math Sandbox</span>
          </Link>
          <Link
            className={`sidebar-link ${pathname === '/troubleshooting' ? 'active' : ''}`}
            to="/troubleshooting"
            aria-label="Troubleshooting"
          >
            <TroubleshootingIcon />
            <span className="sidebar-tooltip">Troubleshooting</span>
          </Link>
        </nav>
        <section className="sidebar-secondary" aria-label="Workshop references">
          {showSidebarNudge ? (
            <div className="sidebar-nudge" role="status" aria-live="polite">
              <p>Refer to Concept Mapping or Reference Files at any time.</p>
              <button
                type="button"
                className="sidebar-nudge-close"
                aria-label="Dismiss sidebar hint"
                onClick={() => setShowSidebarNudge(false)}
              >
                x
              </button>
            </div>
          ) : null}
          <div className="sidebar-divider" />
          <article className="sidebar-hover-group">
            <button type="button" className="sidebar-action" aria-label="Concept Mapping quick view">
              <ConceptIcon />
              <span className="sidebar-tooltip">Concept Mapping</span>
            </button>
            <div className="sidebar-flyout glossary-card">
              <h3>Concept Mapping for Software Devs</h3>
              <ConceptMappingContent />
            </div>
          </article>
          <article className="sidebar-hover-group">
            <button type="button" className="sidebar-action" aria-label="Reference Files quick view">
              <FilesIcon />
              <span className="sidebar-tooltip">Reference Files</span>
            </button>
            <div className="sidebar-flyout reference-card">
              <h3>Reference Files</h3>
              <ReferenceFilesContent />
            </div>
          </article>
        </section>
      </aside>

      <main className="page">
        <section className="hero card">
          <p className="eyebrow">Freenove Section 12 to Smart Home Workshop</p>
          <h1>ESP32 Sensor to Home Assistant over MQTT (Developer Onramp)</h1>
          <p>
            You already code (or are sitting next to someone who already codes). This workshop assumes software
            experience but treats microcontrollers as a new environment, mapping embedded concepts to familiar software
            patterns while wiring the thermistor circuit, publishing MQTT values, and visualizing the sensor in Home
            Assistant.
          </p>
          <p className="key-note">
            <strong>Key workshop change:</strong> use <code>GPIO34</code> for thermistor analog input. <code>GPIO4</code>{' '}
            (ADC2) may not read reliably while WiFi is active.
          </p>
        </section>

        <Outlet />
      </main>
    </div>
  );
}
