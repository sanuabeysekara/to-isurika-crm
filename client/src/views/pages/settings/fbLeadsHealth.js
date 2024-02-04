// material-ui
import { useEffect, useState } from 'react';

import {  } from '@mui/material';
import Chart from "react-apexcharts";
import config from '../../../config';
import { useAuthContext } from '../../../context/useAuthContext';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// ==============================|| SAMPLE PAGE ||============================== //



const FbLeadsHealth = () => {

  const [fbHealthData, setFbHealthData] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const { user } = useAuthContext();

  
  
  
  async function fetchFbHealthData() {
    try {
      setLoading(true);
      const response = await fetch(config.apiUrl + 'api/fbleads-health', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        }
        return;
      }
      const fetchedData = await response.json();
      setFbHealthData(fetchedData);
      console.log(isLoading)
      console.log(fbHealthData)

  
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }
  
  useEffect(() => {
      console.log("sanu")
      fetchFbHealthData();
      
  }, []);
  
  
  const state = {
    series: [{
      name: "Leads at Facebook Server",
      data: fbHealthData.instant_forms_values
    }, {
      name: "Leads at Local Server",
      data: fbHealthData.local_instant_forms_values
    }],
    options: {
      chart: {
        type: 'bar',
        height: 430
      },
      plotOptions: {
        bar: {
          horizontal: true,
          dataLabels: {
            position: 'top',
          },
        }
      },
      dataLabels: {
        enabled: true,
        offsetX: -6,
        style: {
          fontSize: '12px',
          colors: ['#fff']
        }
      },
      stroke: {
        show: true,
        width: 1,
        colors: ['#fff']
      },
      tooltip: {
        shared: true,
        intersect: false
      },
      xaxis: {
        categories: fbHealthData.instant_form_names,
      },
    },
  
  
  };
  
  





  return(<MainCard title="Facebook API Health">
    <Chart
              options={state.options}
              series={state.series}
              type="bar"
              width="700"
              height={430}
            />
  </MainCard>);

};

export default FbLeadsHealth;
