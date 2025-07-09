import { useEffect, useState, useRef } from "react";
import { GridAlgorithm, MarkerClusterer } from "@googlemaps/markerclusterer";

type MarkerType = {
  lat: number;
  lng: number;
  label?: string;
  type?: "personnel" | "sos" | "organization" | "resource" | "request";
};

interface UseClustersProps {
  map: google.maps.Map | null;
  showClusters: boolean;
  data: MarkerType[];
}

export function useClusters({ map, showClusters, data }: UseClustersProps) {
  const [clusterer, setClusterer] = useState<MarkerClusterer | null>(null);
  const [markers, setMarkers] = useState<
    google.maps.marker.AdvancedMarkerElement[]
  >([]);

  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  const getColorForType = (type?: string): string => {
    switch (type) {
      case "personnel":
        return "#3b82f6"; // blue
      case "sos":
        return "#ef4444"; // red
      case "organization":
        return "#10b981"; // green
      case "resource":
        return "#f59e0b"; // amber
      case "request":
        return "#8b5cf6"; // purple
      default:
        return "#666666"; // gray
    }
  };

  const clearMarkers = () => {
    // Clear existing markers
    markersRef.current.forEach((marker) => {
      marker.map = null;
    });
    markersRef.current = [];

    // Clear clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current = null;
    }

    setMarkers([]);
    setClusterer(null);
  };

  useEffect(() => {
    if (!map) return;

    const setupMarkers = async () => {
      try {
        // Clear existing markers first
        clearMarkers();

        if (!showClusters || !data.length) return;

        const { AdvancedMarkerElement, PinElement } =
          (await google.maps.importLibrary(
            "marker"
          )) as google.maps.MarkerLibrary;

        const newMarkers = data.map((item, i) => {
          const color = getColorForType(item.type);
          const pin = new PinElement({
            glyph: item.label || String(i + 1),
            background: color,
            glyphColor: "black",
          });

          const marker = new AdvancedMarkerElement({
            position: { lat: item.lat, lng: item.lng },
            content: pin.element,
            map: map,
          });

          marker.addListener("click", () => {
            new google.maps.InfoWindow({
              content: `<div style="padding: 8px; color:black">
                <strong style="color: black">${
                  item.type?.toUpperCase() || "MARKER"
                }</strong><br>
                <strong style="color: black">${
                  item.label?.toUpperCase() || "MARKER"
                }</strong><br>
                <span style="color: black;">Lat: ${item.lat.toFixed(
                  2
                )}</span><br>
                <span style="color: black;">Lng: ${item.lng.toFixed(2)}</span>
              </div>`,
            }).open({ anchor: marker, map });
          });

          return marker;
        });

        const newClusterer = new MarkerClusterer({
          map,
          markers: newMarkers,
          algorithm: new GridAlgorithm({ maxDistance: 40000 }),
          renderer: {
            render: ({ count, position }) => {
              const div = document.createElement("div");
              div.style.cssText = `
                background: #1f2937;
                color: white;
                
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              `;
              div.textContent = String(count);

              return new AdvancedMarkerElement({
                position,
                content: div,
              });
            },
          },
        });

        // Store references
        markersRef.current = newMarkers;
        clustererRef.current = newClusterer;

        // Update state
        setMarkers(newMarkers);
        setClusterer(newClusterer);
      } catch (error) {
        console.error("Error setting up clusters:", error);
      }
    };

    setupMarkers();

    // Cleanup function
    return () => {
      clearMarkers();
    };
  }, [map, showClusters, data]);

  return { clusterer, markers, clearMarkers };
}
