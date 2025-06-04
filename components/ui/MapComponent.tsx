import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DirectionsRenderer,
  GoogleMap,
  Marker,
  MarkerF,
  useLoadScript,
} from "@react-google-maps/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/lib/translation-context";
import { Legend } from "recharts";
import { InfoWindowF } from "@react-google-maps/api";
import { reqResource } from "@/data/resource";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define types for personnel and SOS alerts
interface Location {
  id: string | number;
  location_lat: number;
  location_lng: number;
  name?: string;
  type?: string;
  resource_type?: string;
  quantity?: number;

  description?: string;
  title?: string;
  unit?: string;
  status?: string;
  address?: string;
  org_type?: string;
  contact?: string;
}

interface MapComponentProps {
  personnel?: Location[];
  sosAlerts?: Location[];
  organization?: Location[];
  resource?: Location[];
  reqResource?: Location[];
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

// const { t } = useTranslation();
// const { t, language, setLanguage } = useTranslation();
export const MapComponent: React.FC<MapComponentProps> = ({
  personnel,
  sosAlerts,
  // organization,
  // resource,
}) => {
  const { t } = useTranslation();
  // Load the Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
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

  // const orgIcon = {
  //   url: "https://maps.google.com/mapfiles/kml/shapes/library_maps.png", // Example building icon
  //   scaledSize: new google.maps.Size(32, 32),
  // };
  // const resIcon = {
  //   url: "http://maps.google.com/mapfiles/kml/pal2/icon7.png", // Example building icon
  //   scaledSize: new google.maps.Size(32, 32),
  // };
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
            {t("maps.legends.personnel")}
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
            {t("maps.legends.sosAlerts")}
          </span>
        </div>
        {/* <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="https://maps.google.com/mapfiles/kml/shapes/library_maps.png"
            alt="Organization Icon"
            style={{ width: "16px", height: "16px", marginRight: "8px" }}
          />
          <span
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "black",
            }}
          >
            {t("maps.legends.organizations")}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src="http://maps.google.com/mapfiles/kml/pal2/icon7.png"
            alt="Resource Icon"
            style={{ width: "16px", height: "16px", marginRight: "8px" }}
          />
          <span
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "black",
            }}
          >
            Resource
          </span>
        </div> */}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("maps.description")}</CardTitle>
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
          {personnel?.map((p) => (
            <MarkerF
              key={p.id}
              position={{ lat: p.location_lat, lng: p.location_lng }}
              icon={personnelIcon}
            />
          ))}

          {/* Render SOS alert markers */}
          {sosAlerts?.map((sos) => (
            <MarkerF
              key={sos.id}
              position={{ lat: sos.location_lat, lng: sos.location_lng }}
              icon={sosIcon}
            />
          ))}
          {/* {organization?.map((org) => (
            <MarkerF
              key={org.id}
              position={{ lat: org.location_lat, lng: org.location_lng }}
              icon={orgIcon}
            />
          ))}
          {resource?.map((org) => (
            <MarkerF
              key={org.id}
              position={{ lat: org.location_lat, lng: org.location_lng }}
              icon={resIcon}
            />
          ))} */}

          <Legend />
        </GoogleMap>
      </CardContent>
    </Card>
  );
};

// Enhanced MapComponent2 with additional features

export const MapComponent2: React.FC<MapComponentProps> = ({
  organization,
  resource,
  reqResource,
}) => {
  const { t } = useTranslation();
  const [selectedMarker, setSelectedMarker] = useState<
    (Location & { type: string }) | null
  >(null);
  const [showClusters, setShowClusters] = useState(true);
  const [filters, setFilters] = useState({
    organizations: true,
    resources: true,
    requests: true,
    resourceTypes: [], // Filter by resource type
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [mapStyle, setMapStyle] = useState("roadmap");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<
    (Location & { [key: string]: any }) | null
  >(null);
  const GOOGLE_MAPS_LIBRARIES: ("places" | "geometry")[] = [
    "places",
    "geometry",
  ];

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES, // Add libraries for enhanced features
  });

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Error getting location:", error)
      );
    }
  }, []);

  // Enhanced marker click handler with info windows
  const handleMarkerClick = (marker: Location, type: string) => {
    setSelectedMarker({ ...marker, type });
  };

  // Get directions to a marker
  const getDirections = useCallback(
    (destination: Location) => {
      if (!userLocation || !window.google) return;

      const directionsService = new google.maps.DirectionsService();

      directionsService.route(
        {
          origin: userLocation,
          destination: {
            lat: destination.location_lat,
            lng: destination.location_lng,
          },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            setDirections(result);
          } else {
            console.error(`Directions request failed: ${status}`);
            setDirections(null);
          }
        }
      );
    },
    [userLocation]
  );

  // Enhanced Legend with toggle functionality
  const Legend = () => {
    return (
      <div className="absolute bottom-5 left-5 bg-white dark: text-black p-4 rounded-lg shadow-lg z-10 max-w-xs">
        <h3 className="font-bold mb-3 text-sm">LEGEND</h3>

        {/* Filter Controls */}
        <div className="space-y-2 mb-4">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={filters.organizations}
              onChange={(e) =>
                setFilters({ ...filters, organizations: e.target.checked })
              }
              className="mr-2"
            />
            <img
              src="https://maps.google.com/mapfiles/kml/shapes/library_maps.png"
              className="w-4 h-4 mr-2"
            />
            {t("maps.legends.organizations")}
          </label>

          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={filters.resources}
              onChange={(e) =>
                setFilters({ ...filters, resources: e.target.checked })
              }
              className="mr-2"
            />
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2" />
            Available Resources
          </label>

          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={filters.requests}
              onChange={(e) =>
                setFilters({ ...filters, requests: e.target.checked })
              }
              className="mr-2"
            />
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2" />
            Requested Resources
          </label>
        </div>

        {/* Map Style Selector */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Map Style:</label>
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            className="w-full text-xs p-1 border rounded"
          >
            <option value="roadmap">Roadmap</option>
            <option value="satellite">Satellite</option>
            <option value="hybrid">Hybrid</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>

        {/* Clustering Toggle */}
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={showClusters}
            onChange={(e) => setShowClusters(e.target.checked)}
            className="mr-2"
          />
          Enable Clustering
        </label>
      </div>
    );
  };

  // Search and Filter Panel

  // Info Window Component
  const InfoWindow: React.FC<{
    marker: Location;
    onClose: () => void;
  }> = ({ marker, onClose }) => {
    return (
      <InfoWindowF
        position={{ lat: marker.location_lat, lng: marker.location_lng }}
        onCloseClick={onClose}
      >
        <div className="p-2 max-w-xs">
          {/* <h3 className="font-bold text-sm mb-2 text-black">
            {marker.name || marker.title}
          </h3>
          {marker.description && (
            <p className="text-xs text-gray-600 mb-2">{marker.description}</p>
          )}
          {marker.type === "resource" && (
            <div className="text-xs text-black">
              <p>
                <strong>Type:</strong> {marker.resource_type}
              </p>
              <p>
                <strong>Quantity:</strong> {marker.quantity}
              </p>
            </div>
          )}
          {marker.contact && (
            <p className="text-xs text-black">
              <strong>Contact:</strong> {marker.contact}
            </p>
          )} */}
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                getDirections(marker);
                onClose();
              }}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              Get Directions
            </button>
            <button
              onClick={() => {
                setSelectedLocation(marker);
                setIsDetailsModalOpen(true);
                onClose();
              }}
              className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
            >
              Details
            </button>
          </div>
        </div>
      </InfoWindowF>
    );
  };

  // Statistics Panel
  const StatsPanel = () => {
    const stats = {
      totalOrgs: organization?.length || 0,
      totalResources: resource?.length || 0,
      totalRequests: reqResource?.length || 0,
    };

    return (
      <div className="absolute top-5 right-5 bg-white dark: text-black p-3 rounded-lg shadow-lg z-10">
        <h3 className="font-bold text-sm mb-2">Statistics</h3>
        <div className="text-xs space-y-1">
          <div>Organizations: {stats.totalOrgs}</div>
          <div>Available Resources: {stats.totalResources}</div>
          <div>Resource Requests: {stats.totalRequests}</div>
        </div>
      </div>
    );
  };

  const mapIcons = useMemo(() => {
    if (!isLoaded) return null;

    return {
      orgIcon: {
        url: "https://maps.google.com/mapfiles/kml/shapes/library_maps.png",
        scaledSize: new google.maps.Size(32, 32),
      },
      resIcon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "green",
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 10,
      },
      reqIcon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "red",
        fillOpacity: 1,
        strokeWeight: 0,
        scale: 5,
      },
    };
  }, [isLoaded]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded || !mapIcons) return <div>Loading Maps...</div>;

  return (
    <Card className={isFullscreen ? "fixed inset-0 z-50" : ""}>
      <CardHeader className={isFullscreen ? "hidden" : ""}>
        <CardTitle>{t("maps.description")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 w-full h-[500px] relative">
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: isFullscreen ? "100vh" : "500px",
          }}
          zoom={11}
          center={center}
          mapTypeId={mapStyle}
          options={{
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "on" }],
              },
            ],
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: false,
          }}
        >
          <StatsPanel />

          {/* User Location Marker */}
          {userLocation && (
            <MarkerF
              position={userLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "blue",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
                scale: 8,
              }}
              title="Your Location"
            />
          )}

          {/* Filtered Markers */}
          {filters.organizations &&
            organization?.map((org) => (
              <MarkerF
                key={`org-${org.id || org.location_lat}-${org.location_lng}`}
                position={{ lat: org.location_lat, lng: org.location_lng }}
                icon={mapIcons.orgIcon}
                onClick={() => handleMarkerClick(org, "organization")}
              />
            ))}

          {filters.resources &&
            resource?.map((res) => (
              <MarkerF
                key={`res-${res.id || res.location_lat}-${res.location_lng}`}
                position={{ lat: res.location_lat, lng: res.location_lng }}
                icon={mapIcons.resIcon}
                onClick={() => handleMarkerClick(res, "resource")}
              />
            ))}

          {filters.requests &&
            reqResource?.map((req) => (
              <MarkerF
                key={`req-${req.id || req.location_lat}-${req.location_lng}`}
                position={{ lat: req.location_lat, lng: req.location_lng }}
                icon={mapIcons.reqIcon}
                onClick={() => handleMarkerClick(req, "request")}
              />
            ))}

          {/* Directions Renderer */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: "#4285F4",
                  strokeWeight: 4,
                },
              }}
            />
          )}

          {/* Info Window */}
          {/* {selectedMarker && (
            <InfoWindow
              marker={selectedMarker}
              onClose={() => setSelectedMarker(null)}
            />
          )} */}
          <Dialog
            open={isDetailsModalOpen}
            onOpenChange={setIsDetailsModalOpen}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedLocation?.name || "Location Details"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm">Latitude</h4>
                    <p className="text-sm">
                      {selectedLocation?.location_lat.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Longitude</h4>
                    <p className="text-sm">
                      {selectedLocation?.location_lng.toFixed(6)}
                    </p>
                  </div>
                </div>

                {selectedLocation?.address && (
                  <div>
                    <h4 className="font-semibold text-sm">Address</h4>
                    <p className="text-sm">{selectedLocation.address}</p>
                  </div>
                )}

                {selectedLocation?.type === "resource" && (
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-semibold text-sm">Resource Type</h4>
                      <p className="text-sm">
                        {selectedLocation.resource_type}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Quantity</h4>
                      <p className="text-sm">
                        {selectedLocation.quantity} {selectedLocation.unit}
                      </p>
                    </div>
                    {selectedLocation.status && (
                      <div>
                        <h4 className="font-semibold text-sm">Status</h4>
                        <p className="text-sm capitalize">
                          {selectedLocation.status}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedLocation?.type === "organization" && (
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-semibold text-sm">
                        Organization Type
                      </h4>
                      <p className="text-sm">{selectedLocation.org_type}</p>
                    </div>
                    {selectedLocation.contact && (
                      <div>
                        <h4 className="font-semibold text-sm">Contact</h4>
                        <p className="text-sm">{selectedLocation.contact}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Legend />
        </GoogleMap>
      </CardContent>
    </Card>
  );
};
