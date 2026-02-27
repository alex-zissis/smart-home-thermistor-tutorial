import { ChangeEvent, useMemo, useState } from 'react';

function calculateTemp(adc: number) {
  const adcClamped = Math.max(1, Math.min(4094, adc));
  const rFixed = 10.0;
  const r0 = 10.0;
  const beta = 3950.0;
  const voltage = (adcClamped / 4095.0) * 3.3;
  const rt = (r0 * voltage) / (3.3 - voltage);
  const tempK = 1 / (1 / (273.15 + 25) + Math.log(rt / rFixed) / beta);
  const tempC = tempK - 273.15;

  return {
    voltage,
    resistance: rt,
    tempC
  };
}

export default function MathPage() {
  const [adc, setAdc] = useState(2048);
  const calc = useMemo(() => calculateTemp(adc), [adc]);

  function onSliderChange(event: ChangeEvent<HTMLInputElement>) {
    setAdc(Number(event.target.value));
  }

  return (
    <section className="card stagger-3">
      <h2>Thermistor Math Sandbox</h2>
      <p>
        Freenove section 12 uses a Beta model (R0=10k, Beta=3950). Move the ADC value and inspect computed
        voltage, resistance, and temperature.
      </p>

      <label className="slider-label" htmlFor="adc-slider">
        ADC reading: <strong>{adc}</strong>
      </label>
      <input id="adc-slider" type="range" min="1" max="4094" value={adc} onChange={onSliderChange} />

      <div className="grid calc-grid">
        <article>
          <h3>Voltage</h3>
          <p>{calc.voltage.toFixed(3)} V</p>
        </article>
        <article>
          <h3>Thermistor R</h3>
          <p>{calc.resistance.toFixed(3)} kOhm</p>
        </article>
        <article>
          <h3>Temperature</h3>
          <p>{calc.tempC.toFixed(2)} C</p>
        </article>
      </div>
    </section>
  );
}
