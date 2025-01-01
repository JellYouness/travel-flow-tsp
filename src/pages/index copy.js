import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  List,
  ListItem,
  IconButton,
} from "@mui/material";
import {
  GoogleMap,
  Marker,
  DirectionsRenderer,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Delete, DragHandle } from "@mui/icons-material";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const defaultCenter = { lat: 33.5892, lng: -7.6868 };

export default function Home() {
  const [locations, setLocations] = useState([]);
  const [directions, setDirections] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [totalDistance, setTotalDistance] = useState("");
  const [totalDuration, setTotalDuration] = useState("");

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const handlePlaceSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const newLocation = {
          name: place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setLocations([...locations, newLocation]);
      }
    }
  };

  const handleAutocompleteLoad = (autocompleteInstance) => {
    setAutocomplete(autocompleteInstance);
  };

  const calculateRoute = async () => {
    if (locations.length < 2) {
      alert("Please add at least two locations.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/solve_tsp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locations }),
      });
      const data = await response.json();

      if (data.path) {
        const orderedLocations = data.path.map((index) => locations[index]);

        const directionsService = new google.maps.DirectionsService();
        const waypoints = orderedLocations.slice(1, -1).map((loc) => ({
          location: { lat: loc.lat, lng: loc.lng },
          stopover: true,
        }));

        const origin = orderedLocations[0];
        const destination = orderedLocations[orderedLocations.length - 1];

        const results = await directionsService.route({
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          waypoints: waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          optimizeWaypoints: true,
          avoidHighways: avoidHighways,
        });

        if (results.status === "OK") {
          setDirections(results);

          const totalDistance =
            results.routes[0].legs.reduce(
              (sum, leg) => sum + leg.distance.value,
              0
            ) / 1000;
          const totalDuration =
            results.routes[0].legs.reduce(
              (sum, leg) => sum + leg.duration.value,
              0
            ) / 60;

          setTotalDistance(`${totalDistance.toFixed(2)} km`);
          setTotalDuration(`${totalDuration.toFixed(0)} min`);
        } else {
          console.error("Directions request failed:", results.status);
          alert("Failed to calculate directions. Please try again.");
        }
      } else {
        alert("Failed to calculate TSP.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while calculating the route.");
    }
  };

  const handleDeleteLocation = (index) => {
    const updatedLocations = locations.filter((_, i) => i !== index);
    setLocations(updatedLocations);
  };

  const sendItinerary = () => {
    if (directions) {
      const route = directions.routes[0];

      if (!route || !route.legs || route.legs.length < 1) {
        alert("No itinerary available. Please calculate the route first.");
        return;
      }

      const origin = `${route.legs[0].start_location.lat()},${route.legs[0].start_location.lng()}`;
      const destination = `${route.legs[
        route.legs.length - 1
      ].end_location.lat()},${route.legs[
        route.legs.length - 1
      ].end_location.lng()}`;

      const waypoints = route.legs
        .slice(0, -1) // Exclude the last leg as it’s the destination
        .map((leg) => `${leg.end_location.lat()},${leg.end_location.lng()}`)
        .join("|");

      // Construct the sharable Google Maps link
      const baseUrl = "https://www.google.com/maps/dir/?api=1";
      const params = new URLSearchParams({
        origin,
        destination,
        waypoints,
        travelmode: "driving",
      }).toString();

      const shareableLink = `${baseUrl}&${params}`;

      // Open the itinerary in a new tab
      window.open(shareableLink, "_blank");
    } else {
      alert("No itinerary available. Please calculate the route first.");
    }
  };

  const renderStepGraph = () => {
    if (!directions) return null;

    const route = directions.routes[0];
    if (!route || !route.legs) return null;

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 3,
        }}
      >
        {route.legs.map((leg, index) => (
          <Box
            key={index}
            sx={{
              textAlign: "center",
              position: "relative",
            }}
          >
            {/* Step Label and Place Name */}
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {leg.start_address}
            </Typography>

            {/* Vertical Line with Arrow */}
            <Box
              sx={{
                width: "2px",
                height: "30px",
                backgroundColor: "gray",
                margin: "5px auto",
                position: "relative",
              }}
            >
              {/* Arrow */}
              <Box
                sx={{
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: "8px solid gray",
                  position: "absolute",
                  bottom: -8, // Position the arrow below the line
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            </Box>
          </Box>
        ))}
        {/* Final Destination */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          End: {route.legs[route.legs.length - 1].end_address}
        </Typography>
      </Box>
    );
  };

  return (
    <Box padding={3}>
      <Typography variant="h5" mb={3}>
        Traveling Salesperson Problem
      </Typography>

      {/* <RadioGroup
        value={addMode}
        onChange={(e) => setAddMode(e.target.value)}
        row
        sx={{ marginBottom: 3 }}
      >
        <FormControlLabel
          value="autocomplete"
          control={<Radio />}
          label="Search Places"
        />
        <FormControlLabel
          value="map"
          control={<Radio />}
          label="Click on Map"
        />
      </RadioGroup> */}

      {isLoaded && (
        <Autocomplete
          onLoad={handleAutocompleteLoad}
          onPlaceChanged={handlePlaceSelect}
        >
          <TextField label="Search for a place" fullWidth />
        </Autocomplete>
      )}

      <Box mt={2}>
        <List>
          {locations.map((location, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDeleteLocation(index)}
                >
                  <Delete />
                </IconButton>
              }
            >
              <DragHandle />
              <Typography variant="body1" sx={{ ml: 2 }}>
                {index + 1}. {location.name}
              </Typography>
            </ListItem>
          ))}
        </List>
      </Box>

      {directions && (
        <Box mb={3}>
          <Typography variant="body1">
            Total Distance: {totalDistance}
          </Typography>
          <Typography variant="body1">
            Total Duration: {totalDuration}
          </Typography>
        </Box>
      )}

      {isLoaded && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={12}
          onClick={(e) => {
            const newLocation = {
              name: `Point (${e.latLng.lat().toFixed(5)}, ${e.latLng
                .lng()
                .toFixed(5)})`,
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            };
            setLocations((prev) => [...prev, newLocation]);
          }}
        >
          {locations.map((loc, index) => (
            <Marker
              key={index}
              position={{ lat: loc.lat, lng: loc.lng }}
              label={(index + 1).toString()}
            />
          ))}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={avoidHighways}
            onChange={(e) => setAvoidHighways(e.target.checked)}
          />
        }
        label="Avoid Highways"
        sx={{ marginTop: 2 }}
      />

      <Button
        variant="contained"
        onClick={calculateRoute}
        sx={{ marginTop: 2, marginRight: 2 }}
      >
        Calculate TSP
      </Button>

      <Button
        variant="outlined"
        onClick={sendItinerary}
        sx={{ marginTop: 2, marginRight: 2 }}
      >
        Envoyer l&apos;itinéraire vers votre téléphone
      </Button>

      <Button
        variant="outlined"
        color="error"
        onClick={() => {
          setLocations([]);
          setDirections(null);
          setTotalDistance("");
          setTotalDuration("");
        }}
        sx={{ marginTop: 2 }}
      >
        Reset
      </Button>

      {/* Render Step Graph */}
      {renderStepGraph()}
    </Box>
  );
}
