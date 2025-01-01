import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function LocationList({ locations, onRemove }) {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Liste des lieux
      </Typography>
      <List>
        {locations.map((location, index) => (
          <ListItem
            key={index}
            secondaryAction={
              <IconButton
                edge="end"
                aria-label="supprimer"
                onClick={() => onRemove(index)}
              >
                <DeleteIcon color="error" />
              </IconButton>
            }
          >
            <ListItemText primary={`${index + 1}. ${location.name}`} />
          </ListItem>
        ))}
      </List>
    </>
  );
}
