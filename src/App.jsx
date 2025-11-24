import React, { useState } from 'react';
import SolarSystem from './SolarSystem';

function App() {
  const [hoveredPlanet, setHoveredPlanet] = useState(null);
  const [selectedPlanet, setSelectedPlanet] = useState(null);
  const [speed, setSpeed] = useState(1);

  // Determine what name to show:
  // 1. If a planet is selected, show that.
  // 2. If no planet selected but hovering, show hovered.
  // 3. Else show general title or instruction.

  let displayText = "Solar System";
  let subText = "Click a planet to focus";

  if (selectedPlanet) {
    displayText = selectedPlanet.name;
    subText = "LOCKED";
  } else if (hoveredPlanet) {
    displayText = hoveredPlanet.name;
    subText = "Click to focus";
  }

  const handleSelection = (planet) => {
    setSelectedPlanet(planet);
    if (planet) {
        // If we select a planet, we might want to stop hovering updates momentarily
        // or just let the priority logic handle it.
        // Priority logic handles it.
    }
  };

  const handleReset = (e) => {
      e.stopPropagation();
      setSelectedPlanet(null);
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 10,
        color: 'white',
        fontFamily: 'monospace',
        pointerEvents: 'none', // Let clicks pass through to canvas where possible, but we need interaction for slider
      }}>
        <div style={{
            background: 'rgba(0,0,0,0.7)',
            padding: '15px',
            borderRadius: '8px',
            border: '1px solid #444',
            pointerEvents: 'auto' // Re-enable pointer events for controls
        }}>
            <h1 style={{ margin: '0 0 5px 0', fontSize: '2em', textTransform: 'uppercase', letterSpacing: '2px' }}>
                {displayText}
            </h1>
            <p style={{ margin: '0 0 15px 0', color: '#aaa', fontSize: '0.9em' }}>
                {subText}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={{ fontSize: '0.8em', color: '#ccc' }}>Orbit Speed: {speed.toFixed(1)}x</label>
                <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    style={{ cursor: 'pointer', width: '200px' }}
                />
            </div>

            {selectedPlanet && (
                 <button
                    onClick={handleReset}
                    style={{
                        marginTop: '15px',
                        background: 'transparent',
                        border: '1px solid white',
                        color: 'white',
                        padding: '5px 10px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: '0.8em',
                        width: '100%'
                    }}
                 >
                     UNLOCK VIEW
                 </button>
            )}
        </div>
      </div>

      <SolarSystem
        speedMultiplier={speed}
        selectedPlanetName={selectedPlanet?.name}
        onHoverChange={setHoveredPlanet}
        onSelectionChange={handleSelection}
      />
    </div>
  );
}

export default App;
