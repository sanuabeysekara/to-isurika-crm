import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function CounselorAssignmentPopup({ isOpen, onClose, counselors, onAssign }) {
  const [selectedCounselor, setSelectedCounselor] = useState(null);

  const handleAssign = () => {
    if (selectedCounselor) {
      onAssign(selectedCounselor);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Assign Counselor</DialogTitle>
      <DialogContent>
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={counselors}
          sx={{ width: 200, my: 2 }}
          renderInput={(params) => <TextField {...params} label="Choose a counsellor" variant="standard" />}
          value={selectedCounselor}
          onChange={(event, newValue) => setSelectedCounselor(newValue)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleAssign} color="primary">
          Assign
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CounselorAssignmentPopup;
