import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Signpost } from "@mui/icons-material";

export default function Header() {
  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Toolbar sx={{ width: "70%", mx: "auto", pt: 4 }}>
        <Typography
          variant="h4"
          component="div"
          fontWeight={700}
          sx={{
            flexGrow: 1,
            color: "secondary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" },
            gap: 1,
          }}
        >
          <Signpost fontSize="large" />
          Travel Flow
        </Typography>
        <Box sx={{ display: { xs: "none", md: "flex" } }}>
          <Button color="inherit" sx={{ fontWeight: 900 }}>
            Accueil
          </Button>
          <Button color="inherit" sx={{ fontWeight: 900 }}>
            À propos
          </Button>
        </Box>
      </Toolbar>
      <Typography
        variant="h6"
        component="div"
        sx={{
          mt: 2,
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: "1px solid",
          borderTop: "1px solid",
          borderColor: "secondary.main",
        }}
      >
        Gestion intelligente et rapide de vos itinéraires
      </Typography>
    </AppBar>
  );
}


