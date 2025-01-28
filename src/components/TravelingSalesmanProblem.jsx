import { useEffect, useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Button,
  Paper,
  Stack,
  ButtonGroup,
  Menu,
  MenuItem,
} from "@mui/material";
import LocationSearch from "./LocationSearch";
import LocationList from "./LocationList";
import MapComponent from "./MapComponent";
import RouteDetails from "./RouteDetails";
import StepGraph from "./StepGraph";
import { useJsApiLoader } from "@react-google-maps/api";

export default function TravelingSalesmanProblem() {
  const [locations, setLocations] = useState([]);
  const [directions, setDirections] = useState(null);
  const [avoidHighways, setAvoidHighways] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApi, setSelectedApi] = useState("held-karp");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleApiSelect = (apiName) => {
    setSelectedApi(apiName);
    setAnchorEl(null);
  };

  const addLocation = (location) => {
    setLocations([...locations, location]);
  };

  const removeLocation = (index) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const calculateRoute = async () => {
    if (locations.length < 2) {
      alert("Please add at least two locations.");
      return;
    }

    try {
      const apiUrl =
        selectedApi === "held-karp"
          ? backendUrl + "/solve_tsp"
          : selectedApi === "nearest-neighbor"
          ? backendUrl + "/solve_tsp_nn"
          : backendUrl + "/solve_tsp_be";

      const response = await fetch(apiUrl, {
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

        directionsService.route(
          {
            origin: { lat: origin.lat, lng: origin.lng },
            destination: { lat: destination.lat, lng: destination.lng },
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true,
            avoidHighways: avoidHighways,
          },
          (results, status) => {
            if (status === "OK") {
              setDirections(results);
            } else {
              console.error("Directions request failed:", status);
              alert("Failed to calculate directions. Please try again.");
            }
          }
        );
      } else {
        alert("Failed to calculate TSP.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while calculating the route.");
    }
  };

  const resetRoute = () => {
    setLocations([]);
    setDirections(null);
  };

  const sendItinerary = () => {
    // Implement the logic to send the itinerary
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <LocationSearch onPlaceSelect={addLocation} isLoaded={isLoaded} />
      </Paper>
      <Stack direction="row" spacing={2}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, width: "100%" }}>
          <LocationList locations={locations} onRemove={removeLocation} />
        </Paper>
        {directions && (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, width: "100%" }}>
            <RouteDetails directions={directions} />
            <StepGraph directions={directions} />
          </Paper>
        )}
      </Stack>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <MapComponent
          isLoaded={isLoaded}
          locations={locations}
          directions={directions}
          onMapClick={addLocation}
        />
      </Paper>
      <Box
        sx={{ display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={avoidHighways}
              onChange={(e) => setAvoidHighways(e.target.checked)}
              color="primary"
            />
          }
          label="Éviter les autoroutes"
        />
        <ButtonGroup variant="contained">
          <Button onClick={calculateRoute}>
            Calculer l&apos;itinéraire ({selectedApi})
          </Button>
          <Button onClick={handleMenuOpen}>▼</Button>
        </ButtonGroup>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => handleApiSelect("held-karp")}>
            Held-Karp
          </MenuItem>
          <MenuItem onClick={() => handleApiSelect("nearest-neighbor")}>
            Nearest Neighbor
          </MenuItem>
          <MenuItem onClick={() => handleApiSelect("best-edge")}>
            Best Edge
          </MenuItem>
        </Menu>
        <Button variant="contained" color="secondary" onClick={sendItinerary}>
          Envoyer l&apos;itinéraire au téléphone
        </Button>
        <Button variant="outlined" color="error" onClick={resetRoute}>
          Réinitialiser
        </Button>
      </Box>
    </Box>
  );
}
