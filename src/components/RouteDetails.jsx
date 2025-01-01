import { Box, Typography } from "@mui/material";

export default function RouteDetails({ directions }) {
  const totalDistance =
    directions.routes[0].legs.reduce(
      (sum, leg) => sum + leg.distance.value,
      0
    ) / 1000;

  const totalDuration =
    directions.routes[0].legs.reduce(
      (sum, leg) => sum + leg.duration.value,
      0
    ) / 60;

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes.toFixed(0)} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} heures ${remainingMinutes.toFixed(0)} minutes`;
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Détails de l'itinéraire
      </Typography>
      <Typography variant="body1">
        Distance totale : {totalDistance.toFixed(2)} km
      </Typography>
      <Typography variant="body1">
        Durée totale : {formatDuration(totalDuration)}
      </Typography>
    </Box>
  );
}
