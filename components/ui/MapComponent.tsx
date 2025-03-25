import React from "react";
import {
  GoogleMap,
  Marker,
  MarkerF,
  useLoadScript,
} from "@react-google-maps/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // Adjust import based on your UI library

// Define types for personnel and SOS alerts
interface Location {
  id: number;
  location_lat: number;
  location_lng: number;
}

interface MapComponentProps {
  personnel: Location[];
  sosAlerts: Location[];
}

// Map container style
const mapContainerStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

// Default center for the map
const center = {
  lat: 26.544205506857356, // Default center latitude (Jalpaiguri)
  lng: 88.70577006, // Default center longitude (Jalpaiguri)
};

const MapComponent: React.FC<MapComponentProps> = ({
  personnel,
  sosAlerts,
}) => {
  // Load the Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "", // Add your Google Maps API key here
  });

  // Handle loading and errors
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  // Define custom icons
  const personnelIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "blue",
    fillOpacity: 1,
    strokeWeight: 0,
    scale: 8,
  };
  // console.log(personnelIcon);
  const sosIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "red",
    fillOpacity: 1,
    strokeWeight: 0,
    scale: 10,
  };
  // console.log(sosIcon);
  const Legend = () => {
    return (
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
          zIndex: 1,
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: "blue",
              borderRadius: "50%",
              marginRight: "8px",
            }}
          />
          <span
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "black",
            }}
          >
            Personnel
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: "red",
              borderRadius: "50%",
              marginRight: "8px",
            }}
          />
          <span
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "black",
            }}
          >
            SOS Alerts
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personnel & SOS Locations</CardTitle>
      </CardHeader>
      <CardContent className="p-0 w-full h-[500px]">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={11}
          center={center}
          options={{
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "on" }], // Hide POI labels
              },
            ],
          }}
        >
          {/* Render personnel markers */}
          {personnel.map((p) => (
            <MarkerF
              key={p.id}
              position={{ lat: p.location_lat, lng: p.location_lng }}
              icon={personnelIcon}
            />
          ))}

          {/* Render SOS alert markers */}
          {sosAlerts.map((sos) => (
            <MarkerF
              key={sos.id}
              position={{ lat: sos.location_lat, lng: sos.location_lng }}
              icon={sosIcon}
            />
          ))}
          <Legend />
        </GoogleMap>
      </CardContent>
    </Card>
  );
};

export default MapComponent;
