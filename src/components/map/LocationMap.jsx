import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet icon'larini to'g'rilash
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Map'ni yangilash komponenti
function MapUpdater({ center, zoom, animate = true }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && 
        center[0] && center[1] && 
        !isNaN(center[0]) && !isNaN(center[1]) &&
        isFinite(center[0]) && isFinite(center[1])) {
      console.log('MapUpdater: Xarita markazi yangilanmoqda:', { center, zoom });
      map.setView(center, zoom, { animate: animate, duration: 0.5 });
    }
  }, [center, zoom, map, animate]);
  
  return null;
}

// Xaritada click qilish uchun komponent
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e);
      }
    },
  });
  return null;
}

export function LocationMap({ 
  latitude, 
  longitude, 
  radius, 
  onLocationChange,
  onRadiusChange 
}) {
  const markerRef = useRef(null);
  
  // Default location (Toshkent)
  const defaultLat = 41.3111;
  const defaultLon = 69.2797;
  
  const currentLat = latitude ? parseFloat(latitude) : defaultLat;
  const currentLon = longitude ? parseFloat(longitude) : defaultLon;
  const currentRadius = radius ? parseFloat(radius) : 500;
  
  const center = [currentLat, currentLon];
  
  // Marker position - latitude va longitude prop'laridan keladi
  const [markerPosition, setMarkerPosition] = useState(() => {
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        return [lat, lng];
      }
    }
    return [defaultLat, defaultLon];
  });
  
  // Marker position'ni yangilash - latitude va longitude prop'lari o'zgarganda
  useEffect(() => {
    if (latitude && longitude && latitude !== '' && longitude !== '') {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng) && 
          lat !== 0 && lng !== 0 &&
          lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        const newPosition = [lat, lng];
        console.log('LocationMap: Yangi koordinatalar olingan:', { lat, lng, newPosition });
        // Faqat agar position o'zgarganda yangilash
        setMarkerPosition(prevPosition => {
          if (!prevPosition || 
              Math.abs(prevPosition[0] - newPosition[0]) > 0.0001 || 
              Math.abs(prevPosition[1] - newPosition[1]) > 0.0001) {
            console.log('LocationMap: Marker position yangilanmoqda:', { 
              old: prevPosition, 
              new: newPosition 
            });
            return newPosition;
          }
          return prevPosition;
        });
      }
    } else if (latitude === '' && longitude === '') {
      // Agar prop'lar bo'sh bo'lsa, defaultni o'rnatish
      setMarkerPosition([defaultLat, defaultLon]);
    }
  }, [latitude, longitude]);
  
  // Marker'ni harakatlantirganda
  const handleMarkerDrag = (e) => {
    const { lat, lng } = e.target.getLatLng();
    setMarkerPosition([lat, lng]);
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  };
  
  // Xaritada click qilganda
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setMarkerPosition([lat, lng]);
    if (onLocationChange) {
      onLocationChange(lat, lng);
    }
  };
  
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Xarita markazini yangilash - marker position yoki center'dan foydalanadi */}
        <MapUpdater 
          center={markerPosition && markerPosition[0] && markerPosition[1] ? markerPosition : center} 
          zoom={15}
          animate={true}
        />
        <MapClickHandler onMapClick={handleMapClick} />
        
        {/* Marker */}
        {markerPosition && markerPosition[0] && markerPosition[1] && (
          <Marker
            key={`${markerPosition[0]}-${markerPosition[1]}`}
            position={markerPosition}
            draggable={true}
            ref={markerRef}
            eventHandlers={{
              dragend: handleMarkerDrag,
            }}
          />
        )}
        
        {/* Radius Circle */}
        {markerPosition && markerPosition[0] && markerPosition[1] && currentRadius && (
          <Circle
            center={markerPosition}
            radius={currentRadius}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.2,
              weight: 2,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}

