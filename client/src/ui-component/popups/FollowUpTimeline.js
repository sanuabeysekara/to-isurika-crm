import React from 'react';
import { Typography, Divider, Grid, Paper, Box } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const FollowUpTimeline = ({ followupDetails }) => {
  if (!followupDetails || followupDetails.length === 0) {
    return <Typography variant="body1">No follow-up history</Typography>;
  }

  const renderArrow = () => {
    return (
      <Box display="flex" alignItems="center" justifyContent="center">
        <ArrowForwardIcon className="arrow" />
      </Box>
    );
  };

  return (
    <Grid container spacing={2} className="followup-timeline">
      {followupDetails.map((followup, index) => (
        <React.Fragment key={followup._id}>
          <Grid item xs={2}>
            <Paper elevation={3} className="followup-box">
              <Box padding={1}>
                <Typography variant="body1">{followup.status}</Typography>
                <Typography variant="body1">{followup.date}</Typography>
              </Box>
            </Paper>
          </Grid>
          {index < followupDetails.length - 1 && renderArrow()}
          {index < followupDetails.length - 1 && (index + 1) % 5 === 0 && (
            <Grid item xs={12}>
              <Divider className="connecting-line" />
            </Grid>
          )}
        </React.Fragment>
      ))}
    </Grid>
  );
};

export default FollowUpTimeline;
