import { useRef, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { TextField, Typography } from "@mui/material";

export default function LocationSearch({ onPlaceSelect, isLoaded }) {
  const [autocomplete, setAutocomplete] = useState(null);
  const inputRef = useRef(null);

  const handlePlaceSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const newLocation = {
          name: place.name || "",
          lat: place.geometry.location?.lat() || 0,
          lng: place.geometry.location?.lng() || 0,
        };
        onPlaceSelect(newLocation);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    }
  };

  return (
    <>
      <Typography variant="h6" gutterBottom>
        Rechercher un lieu
      </Typography>
      {isLoaded && (
        <Autocomplete onLoad={setAutocomplete} onPlaceChanged={handlePlaceSelect}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Entrez un lieu"
            inputRef={inputRef}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
              "& .MuiInputBase-input": {
                color: "text.primary",
              },
            }}
          />
        </Autocomplete>
      )}
    </>
  );
}
