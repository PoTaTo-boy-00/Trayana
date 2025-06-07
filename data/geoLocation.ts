export const getReadableAddress = async (
  lat: number,
  lng: number
): Promise<string> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Set this in your .env file

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      console.warn("No address found for the given coordinates.");
      return `${lat}, ${lng}`;
    }
  } catch (err) {
    console.error("Error in reverse geocoding:", err);
    return `${lat}, ${lng}`;
  }
};
