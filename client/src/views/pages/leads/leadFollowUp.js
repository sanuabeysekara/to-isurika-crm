import React, { useEffect, useState } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Card, CardContent, Divider, Typography } from '@mui/material';
import config from '../../../config';
import { useAuthContext } from '../../../context/useAuthContext';
import { useLogout } from '../../../hooks/useLogout';

export default function LeadfollowUp({ selectedLeadId }) {
  const { user } = useAuthContext();
  const [data, setData] = useState([]);
  const { logout } = useLogout();

  // const [check, setCheck] = useState(false);

  // function formatDate(inputDate) {
  //     const date = new Date(inputDate);
  //     const month = String(date.getMonth() + 1).padStart(2, "0");
  //     const day = String(date.getDate()).padStart(2, "0");
  //     const year = date.getFullYear();
  //     const formattedD = `${year}-${month}-${day}`;
  //     return formattedD;
  // }

  useEffect(() => {
    console.log('leadid', selectedLeadId);
    console.log('followup lead id', selectedLeadId);
    const fetchFollowUpHistory = async () => {
      try {
        const response = await fetch(config.apiUrl + `api/followups/by-lead/${selectedLeadId}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });

        if (response.ok) {
          const followups = await response.json();
          setData(followups);
          console.log('followup data', followups);
        } else {
          console.error('Error fetching followup:', response.statusText);
          if (res.status === 401) {
            console.error('Unauthorized access. Logging out.');
            logout();
          } else if (res.status === 500) {
            console.error('Internal Server Error.');
            logout();
            return;
          } else {
            console.error('Error fetching lead data:', response.statusText);
          }
          return;
        }
      } catch (error) {
        console.error('Error fetching followup:', error.message);
      }
    };
    if (selectedLeadId != null) {
      fetchFollowUpHistory();
      console.log('fetched followup data');
    }
  }, [selectedLeadId]);

  // if (check == true) {

  return (
    <Card>
      <CardContent>
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {data.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={item.user}
                  secondary={
                    <React.Fragment>
                      <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.primary">
                        {item.status}
                      </Typography>
                      {' - '}
                      {item.date}
                      <br />
                      <Typography sx={{ display: 'inline' }} component="span" variant="body2" color="text.gr">
                        {item.comment}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
              {index < data.length - 1 && <Divider variant="middle" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}
