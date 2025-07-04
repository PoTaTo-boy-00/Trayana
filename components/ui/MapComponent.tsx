"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DirectionsRenderer,
  GoogleMap,
  Marker,
  MarkerClusterer,
  MarkerF,
  useLoadScript,
} from "@react-google-maps/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
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
import { supabase } from "@/lib/supabase";
import { requestResources, Resource } from "@/app/types";
import { Badge } from "./badge";
import { BarChart2, Clock, MapPin, X } from "lucide-react";
// import type { AdvancedMarkerElement } from '@googlemaps/markerclusterer';

// Define types for personnel and SOS alerts
interface Location {
  id: string | number;
  location_lat: number;
  location_lng: number;

  // Common properties
  name?: string;
  type?: "personnel" | "sos" | "organization" | "resource" | "request";
  status?: string;
  description?: string;

  // Organization-specific
  org_type?: string;
  contact?: string;
  address?: string;

  // Resource-specific
  resource_type?: string;
  quantity?: number;
  unit?: string;
  expiryDate?: string;

  // Request-specific
  requested_quantity?: number;
  urgency?: string;

  // [key: string]: any; // Optional: for additional dynamic properties
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

// const { t } = useTranslation();
// const { t, language, setLanguage } = useTranslation();
export const MapComponent: React.FC<MapComponentProps> = ({
  personnel: initialPersonnel,
  sosAlerts: initialSosAlerts,
  // organization,
  // resource,
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [personnel, setPersonnel] = useState<Location[]>([]);
  const [sosAlerts, setSosAlerts] = useState<Location[]>([]);
  const [center, setCenter] = useState({
    lat: 26.544205506857356, // default: Jalpaiguri
    lng: 88.70577006,
  });

  // Transform and validate incoming data
  const transformPersonnel = (data: any): Location[] => {
    return (data || [])
      .map((item: any) => {
        let lat = 0,
          lng = 0;

        // Handle different location formats
        if (item.location?.latitude && item.location?.longitude) {
          // Object format: { latitude: number, longitude: number }
          lat = item.location.latitude;
          lng = item.location.longitude;
        } else if (item.location_lat && item.location_lng) {
          // Direct properties
          lat = item.location_lat;
          lng = item.location_lng;
        } else if (
          typeof item.location === "string" &&
          item.location.includes(",")
        ) {
          // String format: "lat, lng"
          const coords = item.location
            .split(",")
            .map((coord: string) => parseFloat(coord.trim()));
          if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            lat = coords[0];
            lng = coords[1];
          }
        }

        return {
          ...item,
          location_lat: lat,
          location_lng: lng,
        };
      })
      .filter(
        (item: Location) =>
          !isNaN(item.location_lat) &&
          !isNaN(item.location_lng) &&
          item.location_lat !== 0 &&
          item.location_lng !== 0
      );
  };

  // Helper function to transform a single item
  const transformSingleItem = (item: any): Location | null => {
    const transformed = transformPersonnel([item]);
    return transformed.length > 0 ? transformed[0] : null;
  };

  // Initialize with validated data
  useEffect(() => {
    setPersonnel(transformPersonnel(initialPersonnel));
    setSosAlerts(transformPersonnel(initialSosAlerts));
  }, [initialPersonnel, initialSosAlerts]);

  useEffect(() => {
    const channel = supabase
      .channel("map_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "personnel",
        },
        (payload) => {
          console.log("Realtime update received:", payload);
          setPersonnel((prev) => {
            switch (payload.eventType) {
              case "INSERT":
                const newItem = transformSingleItem(payload.new);
                if (newItem) {
                  return [...prev, newItem];
                }
                return prev;
              case "UPDATE":
                const updatedItem = transformSingleItem(payload.new);
                if (updatedItem) {
                  return prev.map((p) =>
                    p.id === updatedItem.id ? updatedItem : p
                  );
                }
                return prev;
              case "DELETE":
                return prev.filter(
                  (p) => p.id !== (payload.old as { id: string }).id
                );
              default:
                return prev;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Similar subscription for SOS alerts
  useEffect(() => {
    const channel = supabase
      .channel("sos_updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sos_alerts",
        },
        (payload) => {
          setSosAlerts((prev) => {
            switch (payload.eventType) {
              case "INSERT":
                const newAlert = transformSingleItem(payload.new);
                if (newAlert) {
                  return [...prev, newAlert];
                }
                return prev;
              case "UPDATE":
                const updatedAlert = transformSingleItem(payload.new);
                if (updatedAlert) {
                  return prev.map((s) =>
                    s.id === updatedAlert.id ? updatedAlert : s
                  );
                }
                return prev;
              case "DELETE":
                return prev.filter(
                  (s) => s.id !== (payload.old as { id: string }).id
                );
              default:
                return prev;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching geolocation:", error);
          // optionally fallback or notify user
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  }, []);

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

  const sosIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: "red",
    fillOpacity: 1,
    strokeWeight: 0,
    scale: 10,
  };

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
            {t("maps.legends.personnel")}({personnel.length})
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
            {t("maps.legends.sosAlerts")}({sosAlerts.length})
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("maps.desc1")}</CardTitle>
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

          <Legend />
        </GoogleMap>
      </CardContent>
    </Card>
  );
};
// Enhanced MapComponent2 with additional features

export const MapComponent2: React.FC<MapComponentProps> = ({
  organization = [],
  resource = [],
  reqResource = [],
}) => {
  // console.log("top down resource part", resource);
  const { t } = useTranslation();
  const [selectedMarker, setSelectedMarker] = useState<
    (Location & { type: string }) | null
  >(null);
  const [showClusters, setShowClusters] = useState(true);
  const [clusterer, setClusterer] = useState<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
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
  const [showStats, setShowStats] = useState(false);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: GOOGLE_MAPS_LIBRARIES,
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

  useEffect(() => {
    console.log(organization);
  }, [organization]);

  // Enhanced marker click handler with info windows
  const handleMarkerClick = (
    marker: Location & { id: string },
    type: "personnel" | "sos" | "organization" | "resource" | "request"
  ) => {
    setSelectedMarker({ ...marker, id: marker.id, type });
  };

  const [center, setCenter] = useState({
    lat: 26.544205506857356, // default: Jalpaiguri
    lng: 88.70577006,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error fetching geolocation:", error);
          // optionally fallback or notify user
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
    }
  }, []);

  // Get directions to a marker
  const getDirections = useCallback(
    async (destination: Location, waypoints: Location[] = []) => {
      if (!userLocation || !window.google) return;

      try {
        const directionsService = new google.maps.DirectionsService();

        // Routes API provides more detailed request options
        const request: google.maps.DirectionsRequest = {
          origin: userLocation,
          destination: {
            lat: destination.location_lat,
            lng: destination.location_lng,
          },
          travelMode: google.maps.TravelMode.DRIVING,
          // Additional Routes API features:
          optimizeWaypoints: waypoints.length > 0, // Optimize waypoint order
          provideRouteAlternatives: true, // Get multiple route options
          drivingOptions: {
            departureTime: new Date(), // For traffic-aware routing
            trafficModel: google.maps.TrafficModel.BEST_GUESS,
          },
          // // Add vehicle info for more accurate routing
          // vehicleInfo: {
          //   emissionType: google.maps.VehicleEmissionType.GASOLINE
          // }
        };

        if (waypoints.length > 0) {
          request.waypoints = waypoints.map((wp) => ({
            location: new google.maps.LatLng(wp.location_lat, wp.location_lng),
            stopover: true,
          }));
        }

        const result = await directionsService.route(request);
        setDirections(result);

        // Routes API provides additional data you can use:
        console.log("Route metadata:", result.routes[0]);
        console.log("Toll info:", result);
      } catch (error) {
        console.error("Directions request failed:", error);
        setDirections(null);
      }
    },
    [userLocation]
  );

  // Initialize markers

  // Enhanced Legend with toggle functionality
  const Legend = () => {
    return (
      <div className="absolute bottom-5 left-5 bg-white dark: text-black p-4 rounded-lg shadow-lg z-10 max-w-xs">
        <h3 className="font-bold mb-3 text-sm">{t("maps.cardTitle")}</h3>
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
            {t("maps.Available_Resources")}
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
            {t("maps.Resource_Requests")}
          </label>
        </div>
        {/* Map Style Selector */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            {t("maps.Map_Style")}:
          </label>
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            className="w-full text-xs p-1 border rounded"
          >
            <option value="roadmap">{t("maps.Roadmap")}</option>
            <option value="satellite">{t("maps.Satellite")}</option>
            <option value="hybrid">{t("maps.Hybrid")}</option>
            <option value="terrain">{t("maps.Terrain")}</option>
          </select>
        </div>
        Clustering Toggle
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={showClusters}
            onChange={(e) => setShowClusters(e.target.checked)}
            className="mr-2"
          />
          {t("maps.Enable_Clustering")}
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
    console.log(marker);
    const renderContent = () => {
      const Label = ({ children }: { children: React.ReactNode }) => (
        <span className="w-24 font-medium text-gray-700 flex-shrink-0">
          {children}
        </span>
      );

      const Row = ({
        label,
        value,
        isUrgent = false,
      }: {
        label: string;
        value: React.ReactNode;
        isUrgent?: boolean;
      }) => (
        <div className="flex items-start gap-2 text-sm text-gray-800">
          <Label>{label}</Label>
          <span
            className={`${
              isUrgent ? "text-red-600 font-semibold" : "text-gray-800"
            } break-words whitespace-pre-wrap`}
          >
            {value}
          </span>
        </div>
      );

      switch (marker.type) {
        case "organization":
          return (
            <>
              {marker.org_type && <Row label="Type:" value={marker.org_type} />}
              {marker.contact && (
                <Row label="Contact:" value={marker.contact} />
              )}
              {marker.address && (
                <Row label="Address:" value={marker.address} />
              )}
            </>
          );

        case "resource":
          return (
            <>
              {marker.resource_type && (
                <Row label="Type:" value={marker.resource_type} />
              )}
              {marker.quantity && (
                <Row
                  label="Quantity:"
                  value={`${marker.quantity} ${marker.unit || ""}`}
                />
              )}
              {marker.expiryDate && (
                <Row
                  label="Expires:"
                  value={new Date(marker.expiryDate).toLocaleDateString()}
                />
              )}
            </>
          );

        case "request":
          return (
            <>
              {marker.resource_type && (
                <Row label="Needs:" value={marker.resource_type} />
              )}
              {marker.quantity && (
                <Row
                  label="Amount:"
                  value={`${marker.quantity} ${marker.unit || ""}`}
                />
              )}
              {marker.urgency && (
                <Row label="Urgency:" value={marker.urgency} isUrgent />
              )}
            </>
          );

        default:
          return (
            <div className="text-sm text-gray-500 italic">
              No additional information available.
            </div>
          );
      }
    };

    return (
      <InfoWindowF
        position={{ lat: marker.location_lat, lng: marker.location_lng }}
        onCloseClick={onClose}
      >
        <div className="p-4 max-w-xs w-full bg-white rounded-xl shadow-md border border-gray-200">
          {/* Header */}
          <div
            className={`flex items-center justify-between px-3 py-2 rounded-t-md ${
              marker.type === "organization"
                ? "bg-blue-100"
                : marker.type === "resource"
                ? "bg-green-100"
                : marker.type === "request"
                ? "bg-red-100"
                : "bg-gray-100"
            }`}
          >
            <h3 className="font-semibold text-sm text-gray-800">
              {marker.name || `${marker.type || "Location"} Details`}
            </h3>
            {marker.type && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full tracking-wide uppercase ${
                  marker.type === "organization"
                    ? "bg-blue-500 text-white"
                    : marker.type === "resource"
                    ? "bg-green-500 text-white"
                    : marker.type === "request"
                    ? "bg-red-500 text-white"
                    : "bg-gray-500 text-white"
                }`}
              >
                {marker.type}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="text-sm px-3 py-2 space-y-3">
            {/* Location */}
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Location</p>
                <p className="text-xs text-gray-500">
                  {marker.location_lat?.toFixed(4)},{" "}
                  {marker.location_lng?.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Dynamic content */}
            <div className="space-y-2">{renderContent()}</div>

            {/* Status */}
            {marker.status && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700">
                  Status:
                </span>
                <Badge
                  variant={
                    marker.status === "available"
                      ? "default"
                      : marker.status === "pending"
                      ? "secondary"
                      : marker.status === "urgent"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {marker.status}
                </Badge>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t px-3 pt-2">
            <button
              onClick={onClose}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 transition"
            >
              Close
            </button>
          </div>
          <button
            onClick={() => getDirections(marker)}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Get Directions
          </button>
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
        <h3 className="font-bold text-sm mb-2">{t("maps.Statistics")}</h3>
        <div className="text-xs space-y-1">
          <div>
            {t("maps.Organizations")}: {stats.totalOrgs}
          </div>
          <div>
            {t("maps.Available_Resources")}: {stats.totalResources}
          </div>
          <div>
            {t("maps.Resource_Requests")}: {stats.totalRequests}
          </div>
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
        <CardDescription>
          {showStats && (
            <div className="relative inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="overflow-y-auto p-6">
                <StatsPanel />
              </div>
            </div>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 w-full h-[500px] relative">
        {/* Floating Toggle Button */}
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={() => setShowStats(!showStats)}
            className="bg-slate-600 hover:bg-gray-400 p-2 rounded-full shadow-lg"
            title="Toggle Stats Panel"
          >
            {showStats ? (
              <X className="w-5 h-5" />
            ) : (
              <BarChart2 className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Floating StatsPanel */}

        {/* Directions Box */}
        {directions && (
          <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg z-30">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-black">
                {directions.routes[0].legs[0].duration?.text}
              </span>
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {directions.routes[0].legs[0].distance?.text}
            </div>
          </div>
        )}
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: isFullscreen ? "100vh" : "500px",
          }}
          zoom={12}
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
          {/* Organizations */}
          {organization.map((org) => (
            <MarkerF
              key={`org-${org.id}`}
              position={{ lat: org.location_lat, lng: org.location_lng }}
              icon={mapIcons.orgIcon}
              onClick={() =>
                setSelectedMarker({
                  id: String(org.id),
                  location_lat: org.location_lat,
                  location_lng: org.location_lng,
                  name: org.name,
                  type: "organization",
                  org_type: org.org_type,
                  contact: org.contact,
                  address: org.address,
                })
              }
            />
          ))}
          {/* Resources */}
          {resource.map((res) => (
            <MarkerF
              key={`res-${res.id}`}
              position={{ lat: res.location_lat, lng: res.location_lng }}
              icon={mapIcons.resIcon}
              onClick={() =>
                setSelectedMarker({
                  id: String(res.id),
                  location_lat: res.location_lat,
                  location_lng: res.location_lng,
                  name: res.name,
                  type: "resource",
                  resource_type: res.resource_type,
                  quantity: res.quantity,
                  unit: res.unit,
                  status: res.status,
                  expiryDate: res.expiryDate,
                })
              }
            />
          ))}
          {/* Requests */}
          {reqResource.map((req) => (
            <MarkerF
              key={`req-${req.id}`}
              position={{ lat: req.location_lat, lng: req.location_lng }}
              icon={mapIcons.reqIcon}
              onClick={() =>
                setSelectedMarker({
                  id: String(req.id),
                  location_lat: req.location_lat,
                  location_lng: req.location_lng,
                  name: req.name,
                  type: "request",
                  resource_type: req.resource_type,
                  requested_quantity: req.requested_quantity,
                  urgency: req.urgency,
                })
              }
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
          {selectedMarker && (
            <InfoWindow
              marker={selectedMarker}
              onClose={() => setSelectedMarker(null)}
            />
          )}
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
