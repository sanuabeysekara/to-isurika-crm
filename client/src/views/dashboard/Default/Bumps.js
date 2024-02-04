import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { CardContent, Grid, Typography } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import SkeletonPopularCard from 'ui-component/cards/Skeleton/PopularCard';
import { gridSpacing } from 'store/constant';
import config from '../../../config';
import { useAuthContext } from '../../../context/useAuthContext';
import { useState } from 'react';
import { useEffect } from 'react';
import BumpedIcon from 'assets/images/icons/bumped.svg';


// assets
// import ChevronRightOutlinedIcon from '@mui/icons-material/ChevronRightOutlined';
// import EarningIcon from 'assets/images/icons/courses.svg';

// ==============================|| DASHBOARD DEFAULT - POPULAR CARD ||============================== //

const Bumps = ({ isLoading }) => {
  // const itemsPerPage = 4;
  // const [currentPage, setCurrentPage] = React.useState(1);

  // Calculate the start and end index of the products for the current page
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;

  // Display only the products for the current page
  // const displayedProducts = isLoading ? [] : products.slice(startIndex, endIndex);
  const { user } = useAuthContext();

  const [bumpLeadsDetails, setBumpLeadDetails] = useState({});

  const fetchBumpedLeadCounts = async () => {
    try {
      const bumpLeads = await fetch(config.apiUrl + 'api/getBumps', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      });
      if (!bumpLeads.ok) {
        console.error('Error updating lead data', bumpLeads.statusText);
        return;
      } else {
        console.log('Successfully fetched bumped leads');
        const bumpsjson = await bumpLeads.json()
        console.log("Bumps", bumpsjson)
        console.log("Bumps first", bumpsjson.first)
        setBumpLeadDetails(bumpsjson)
      }
    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    fetchBumpedLeadCounts();
  }, [])

  return (
    <>
      {isLoading ? (
        <SkeletonPopularCard />
      ) : (
        <MainCard content={false}>
          <CardContent>
            <Grid container spacing={gridSpacing} direction="row" justifyContent="space-between">
              <Grid item xs={12}>
                <Grid container alignContent="center" justifyContent="space-between">
                  <Grid item>
                    <Typography variant="h4">Bumped Leads</Typography>
                  </Grid>
                  <Grid item></Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sx={{ pt: '60px !important' }}>
                <img src={BumpedIcon} alt="bumped" />
              </Grid>
              <Grid item xs={12}>
                <Grid container direction="column">
                  <CardContent >
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      First Bump Leads
                    </Typography>
                    <Typography variant="h5" component="div">
                      {bumpLeadsDetails.first}
                    </Typography>
                  </CardContent>
                  <CardContent >
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      Second Bump Leads
                    </Typography>
                    <Typography variant="h5" component="div">
                      {bumpLeadsDetails.second}
                    </Typography>
                  </CardContent>
                  <CardContent md={4}>
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                      Critical Leads
                    </Typography>
                    <Typography variant="h5" component="div">
                      {bumpLeadsDetails.critical}
                    </Typography>
                  </CardContent>

                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </MainCard>
      )}
    </>
  );
};

Bumps.propTypes = {
  isLoading: PropTypes.bool,
  // products: PropTypes.array
};

export default Bumps;
