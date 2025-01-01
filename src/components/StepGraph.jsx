import { Box, Typography } from "@mui/material";

export default function StepGraph({ directions }) {
  const route = directions.routes[0];
  if (!route || !route.legs) return null;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Étapes de l'itinéraire
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {route.legs.map((leg, index) => (
          <Box key={index} sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {index + 1}
            </Box>
            <Box sx={{ ml: 2 }}>
              <Typography variant="body1" fontWeight="medium">
                {leg.start_address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {leg.distance.text}, {leg.duration.text}
              </Typography>
            </Box>
          </Box>
        ))}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              minWidth: 32,
              minHeight: 32,
              borderRadius: "50%",
              bgcolor: "secondary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
            }}
          >
            {route.legs.length + 1}
          </Box>
          <Box sx={{ ml: 2 }}>
            <Typography variant="body1" fontWeight="medium">
              {route.legs[route.legs.length - 1].end_address}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
