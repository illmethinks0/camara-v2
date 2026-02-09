import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './GeographicMap.module.css';

// Fix for default markers in React + Leaflet
const IconDefault = (L.Icon as any).Default;
delete IconDefault.prototype._getIconUrl;
IconDefault.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationCoordinate {
  city: string;
  state: string;
  lat: number;
  lng: number;
  count: number;
}

interface GeographicMapProps {
  locationCoordinates: LocationCoordinate[];
}

const GeographicMap: React.FC<GeographicMapProps> = ({ locationCoordinates }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapError, setMapError] = React.useState<string | null>(null);

  // Default coordinates for Spain/Balearic Islands region
  const defaultLocations: LocationCoordinate[] = [
    { city: 'Mahón', state: 'Menorca', lat: 39.8885, lng: 4.2583, count: 45 },
    { city: 'Ciutadella', state: 'Menorca', lat: 40.0000, lng: 3.8333, count: 38 },
    { city: 'Palma', state: 'Mallorca', lat: 39.5696, lng: 2.6502, count: 32 },
    { city: 'Barcelona', state: 'Cataluña', lat: 41.3851, lng: 2.1734, count: 28 },
    { city: 'Madrid', state: 'Madrid', lat: 40.4168, lng: -3.7038, count: 24 },
  ];

  const locations = locationCoordinates.length > 0 ? locationCoordinates : defaultLocations;
  const maxCount = Math.max(...locations.map(loc => loc.count));

  const getMarkerColor = (count: number): string => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return '#dc3545'; // Red for high volume
    if (ratio > 0.4) return '#ffc107'; // Yellow for medium volume
    return '#17a2b8'; // Blue for low volume
  };

  const getMarkerSize = (count: number): number => {
    const ratio = count / maxCount;
    return Math.max(20, Math.min(40, ratio * 40));
  };

  useEffect(() => {
    if (!mapRef.current) return;

    try {
      // Initialize map centered on Balearic Islands
      const map = L.map(mapRef.current, {
        center: [39.6, 2.9], // Centered on Balearic Islands
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
      });

      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles with error handling
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NYXAgbm90IGF2YWlsYWJsZTwvdGV4dD48L3N2Zz4='
      }).addTo(map).on('tileerror', () => {
        console.warn('Map tiles failed to load, demo will continue with fallback');
      });

      // Add markers for each location with error handling
      locations.forEach((location) => {
        try {
          const markerSize = getMarkerSize(location.count);
          const markerColor = getMarkerColor(location.count);

          // Create custom icon based on data
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background-color: ${markerColor};
                width: ${markerSize}px;
                height: ${markerSize}px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: ${Math.max(8, markerSize / 3)}px;
              ">
                ${location.count}
              </div>
            `,
            iconSize: [markerSize, markerSize],
            iconAnchor: [markerSize / 2, markerSize / 2],
          });

          const marker = L.marker([location.lat, location.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <div style="text-align: center; padding: 5px;">
                <h4 style="margin: 0 0 5px 0; color: #333;">${location.city}</h4>
                <p style="margin: 0; color: #666;">${location.state}</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; font-weight: bold; color: ${markerColor};">
                  ${location.count} registros
                </p>
              </div>
            `);

          // Add hover effects with error handling
          marker.on('mouseover', function(this: any) {
            try {
              this.openPopup();
            } catch (e) {
              console.warn('Marker popup failed to open:', e);
            }
          });
        } catch (e) {
          console.warn('Failed to create marker for location:', location.city, e);
        }
      });

      setMapError(null); // Clear any previous errors
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError('Map initialization failed. Showing data list instead.');
    }

    // Cleanup function
    return () => {
      try {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      } catch (e) {
        console.warn('Map cleanup warning:', e);
      }
    };
  }, [locations, maxCount]);

  return (
    <div className={`card ${styles.geographicMap}`}>
      <div className={styles.header}>
        <h3 className="metric-label">Distribución Geográfica</h3>
        <div className={styles.mapLegend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.high}`}></div>
            <span>Alto volumen</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.medium}`}></div>
            <span>Medio</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.low}`}></div>
            <span>Bajo</span>
          </div>
        </div>
      </div>
      
      <div className={styles.mapContainer}>
        {mapError ? (
          <div className={styles.mapFallback}>
            <div className={styles.fallbackIcon}>🗺️</div>
            <h4>Mapa no disponible</h4>
            <p>Mostrando datos en lista</p>
          </div>
        ) : (
          <div 
            ref={mapRef} 
            className={styles.leafletMap}
            style={{ height: '300px', width: '100%', borderRadius: '8px' }}
          />
        )}
      </div>

      <div className={styles.locationsList}>
        <h4 className={styles.listTitle}>Top Ubicaciones</h4>
        {locations
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
          .map((location, index) => (
            <div key={`${location.city}-${location.state}`} className={styles.locationItem}>
              <div className={styles.locationRank}>{index + 1}</div>
              <div className={styles.locationName}>
                {location.city}, {location.state}
              </div>
              <div className={styles.locationCount}>{location.count}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default GeographicMap;