import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Grid, Avatar, Box, Divider } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BusinessIcon from '@mui/icons-material/Business';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import config from '../../config';
import { useAuthContext } from '../../context/useAuthContext';
import { useLogout } from '../../hooks/useLogout';
//import FollowUpTimeline from './FollowUpTimeline';
import LinearProgress from '@mui/material/LinearProgress';

import 'reactflow/dist/style.css';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';

import CustomNode from '../../views/pages/leads/customNode';

const nodeTypes = {
  customNode: CustomNode,
};


const LeadDetailsPopup = ({ isOpen, onClose, leadDetails }) => {



  // Custom array of JSON objects
  let mappedFollowupDetails = []
  let mappedInitialEdges = []

  const [isLoading, setIsLoading] = useState(false); // New loading state
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const [nodes, setNodes, onNodesChange] = useNodesState(mappedFollowupDetails);
  const [edges, setEdges, onEdgesChange] = useEdgesState([mappedInitialEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );




  // Fetch follow-up details when leadDetails change
  useEffect(() => {
    const fetchFollowUpHistory = async () => {
      try {
        setIsLoading(true); // Set loading to true when starting the fetch

        if (!leadDetails) {
          // Reset followupDetails if leadDetails is falsy
          return;
        }

        const response = await fetch(config.apiUrl + `api/followups/by-lead/${leadDetails.id}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });

        if (response.ok) {
          const followups = await response.json();
          console.log('followup data', followups);


          const mappedFollowupDetails = followups.map((followup, index) => {
            let xVal
            let yVal
            let sPosition
            let tPosition
            if(index%3==0){
              xVal= 150
              yVal= ((index)/3)*100
              sPosition="right"
              tPosition="top"
            }
            if(index%3==1){
              xVal= 350
              yVal= ((index-1)/3)*100
              sPosition="right"
              tPosition="left"
            }
            if(index%3==2){
              xVal= 550
              yVal= ((index-2)/3)*100
              sPosition="bottom"
              tPosition="left"
            }
       
              yVal = yVal+50
            
              let cusColor = "#e6e3e3";
              if(followup.status=="New"){
                cusColor = "#c7dbff"
              }
              if(followup.status=="Dropped" || followup.status=="Fake"){
                cusColor = "#ffc7d0"
              }
              if(followup.status=="Duplicate"){
                cusColor = "#fcbca7"
              }
              if(followup.status=="Registered"){
                cusColor = "#c4ffc2"
              }
              if(followup.status=="Next intake"){
                cusColor = "#fff2d1"
              }
  
            
            return {
              id: index.toString(),
              sourcePosition: sPosition,
              targetPosition: tPosition,
              position: { x: xVal, y: yVal },
              type:'customNode',
              data: { label: followup.status , comment:followup.date,color:cusColor},
              handle: {
                x: 0.5, // Adjust the handle x-position as needed
                y: 1,   // Adjust the handle y-position as needed
              },
            };
          });

          const mappedInitialEdges = followups.map((followup, index) => {
            return {
              id: `e${index}-${index + 1}`,
              source: index.toString(),
              type: 'smoothstep',
              animated: true,
              target: (index + 1).toString()
            };
          });
          setNodes(mappedFollowupDetails);
          setEdges(mappedInitialEdges);


        } else {
          console.error('Error fetching followup:', response.statusText);
          if (response.status === 401) {
            console.error('Unauthorized access. Logging out.');
            logout();
          } else {
            console.error('Error fetching lead data:', response.statusText);
          }
        }
      } catch (error) {
        console.error('Error fetching followup:', error.message);
      } finally {
        setIsLoading(false); // Set loading to false after fetch completion (success or failure)
      }
    };

    fetchFollowUpHistory();
  }, [leadDetails]);

  const handleClose = () => {
    onClose();
  };

  if (!leadDetails) {
    return null;
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <Avatar>
              <PersonIcon />
            </Avatar>
          </Grid>
          <Grid item>
            <Typography variant="h3">{leadDetails.name}</Typography>
            <Typography variant="h5" color="textSecondary">
              {leadDetails.branch} | {leadDetails.course}
            </Typography>
          </Grid>
        </Grid>
      </DialogTitle>
      <Divider sx={{ mt: 3, mb: 2 }} />
      <DialogContent>



        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box mb={2}>
              <Typography variant="h4">Student Details</Typography>
            </Box>
            {renderDetail('Location', leadDetails.address, <LocationOnIcon />)}
            {renderDetail('NIC', leadDetails.nic, <CreditCardIcon />)}
            {renderDetail('Email', leadDetails.email, <EmailIcon />)}
            {renderDetail('Phone', leadDetails.contact_no, <PhoneIcon />)}
            {renderDetail('DOB', leadDetails.dob, <CalendarTodayIcon />)}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box mb={2}>
              <Typography variant="h4">Other Details</Typography>
            </Box>
            {renderDetail('Course', leadDetails.course, <SchoolIcon />)}
            {renderDetail('Branch', leadDetails.branch, <BusinessIcon />)}
            {renderDetail('Counsellor', leadDetails.counsellor, <PersonIcon />)}
            {renderDetail('Status', leadDetails.status, <EmojiEventsIcon />)}
            {renderDetail('Source', leadDetails.source, <AccountBalanceIcon />)}
          </Grid>
          <Grid item xs={12}>
            <Box mb={2}>
              <Typography variant="h4">Follow-up History</Typography>
            </Box>
            {isLoading ? (
              <LinearProgress />
            ) : (
              <div style={{ width: '100%', height: '50vh' }}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                >
                  <Controls />
                  <MiniMap />
                  <Background variant="dots" gap={12} size={1} />
                </ReactFlow>      
             </div>)}
          </Grid>



        </Grid>
      </DialogContent>
      <Divider sx={{ mt: 3, mb: 2 }} />
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  function renderDetail(label, value, icon) {
    // Convert UTC string to local date format
    if (label === 'DOB' && value) {
      const date = new Date(value);
      value = date.toLocaleDateString();
    }

    return (
      <Box sx={{ marginBottom: 1 }}>
        <Typography variant="body1" display="flex" alignItems="center">
          {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
          <span>{label}:</span>&nbsp;&nbsp;{value}
        </Typography>
      </Box>
    );
  }
};

export default LeadDetailsPopup;
