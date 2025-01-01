import { useState, useCallback } from "react";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Box, CircularProgress, Typography } from "@mui/material";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = { lat: 33.5892, lng: -7.6868 };

export default function MapComponent({ isLoaded, locations, directions, onMapClick }) {
  const [map, setMap] = useState(null);

  const onLoad = useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = (e) => {
    if (e.latLng && map) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: e.latLng }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const newLocation = {
            name: results[0].formatted_address,
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };
          onMapClick(newLocation);
        } else {
          console.error("Geocoder failed due to: " + status);
        }
      });
    }
  };

  if (!isLoaded) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 500,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 550, width: "100%" }}>
      <Typography variant="h6" mb={2}>
        {directions ? "L'itinéraire des lieux selectionnés" : "Selectionner par carte"}
      </Typography>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
      >
        {!directions &&
          locations.map((loc, index) => (
            <Marker
              key={index}
              position={{ lat: loc.lat, lng: loc.lng }}
              label={(index + 1).toString()}
            />
          ))}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </Box>
  );
}
