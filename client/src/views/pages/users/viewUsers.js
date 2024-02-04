import * as React from 'react';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { useMediaQuery, Typography, TextField, InputAdornment, MenuItem, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import ModeIcon from '@mui/icons-material/Mode';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LinearProgress from '@mui/material/LinearProgress';
import config from '../../../config';
import { useAuthContext } from '../../../context/useAuthContext';
import { useLogout } from '../../../hooks/useLogout';

export default function ViewUsers() {
  const { user } = useAuthContext();
  const { permissions } = user || {};
  const [userTypes, setUserTypes] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const logout = useLogout();
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const fetchData = async () => {
    try {
      const res = await fetch(config.apiUrl + 'api/users', {
        method: 'GET',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        }

        if (res.status === 500) {
          console.error('Internal Server Error.');
          logout();
          return;
        }
        return;
      }
      const data = await res.json();
      const formattedData = data.map((item) => ({ id: item._id, ...item }));
      const filteredUsers = formattedData.filter(
        (user) =>
          (!selectedUserType || user.user_type?.name === selectedUserType) &&
          (user.name.toLowerCase().includes(searchText.toLowerCase()) || user.email.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredData(filteredUsers);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setError(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch user types
    const fetchUserTypes = async () => {
      try {
        const res = await fetch(config.apiUrl + 'api/user_types', {
          method: 'GET',
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (!res.ok) {
          if (res.status === 401) {
            console.error('Unauthorized access. Logging out.');
            logout();
          }

          if (res.status === 500) {
            console.error('Internal Server Error.');
            logout();
            return;
          }
          return;
        }
        const data = await res.json();
        setUserTypes(data);
      } catch (error) {
        console.error(error);
        setError(error);
      }
    };

    if (user) {
      fetchUserTypes();
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [selectedUserType, searchText]);

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));

  const columns = [
    { field: 'name', headerName: 'User Name', flex: 1 },
    { field: 'email', headerName: 'User Email', flex: 1 },
    {
      field: 'user_type.name',
      headerName: 'User Type',
      flex: 2,
      valueGetter: (params) => params.row.user_type?.name || ''
    },
    {
      field: 'edit',
      headerName: '',
      description: 'This column has a value getter and is not sortable.',
      sortable: false,
      align: 'right',
      width: 200,
      renderCell: (params) => (
        <>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              updateUser(params.row._id);
            }}
          >
            <ModeIcon style={{ marginRight: '5px' }} />
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // Handle delete logic here
            }}
            style={{ marginLeft: '5px' }}
          >
            <DeleteIcon style={{ marginRight: '5px' }} />
          </Button>
        </>
      )
    }
  ];

  function updateUser(userId) {
    console.log('clicked user id', userId);
    navigate('/app/users/update?id=' + userId);
  }

  if (error) {
    return <div>Error fetching data: {error.message}</div>;
  }

  function handleButtonClick() {
    navigate('/app/users/add');
  }

  return (
    <>
      <MainCard
        title="View Users"
        buttonLabel={permissions?.user?.includes('create') ? 'Add New User' : undefined}
        onButtonClick={handleButtonClick}
      >
        {loading && <LinearProgress />}
        <Grid container direction="column" justifyContent="center">
          <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>
            {/* Search Textfield */}
            <Grid item xs={8} sm={5}>
              <Typography variant="h5" component="h5">
                Search
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                name="search"
                type="text"
                value={searchText}
                onChange={handleSearchChange}
                SelectProps={{ native: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            {/* User Type Select */}
            <Grid item xs={8} sm={5}>
              <Typography variant="h5" component="h5">
                User Type
              </Typography>
              <TextField
                fullWidth
                margin="normal"
                name="userType"
                select
                value={selectedUserType}
                onChange={(e) => setSelectedUserType(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MergeTypeIcon />
                    </InputAdornment>
                  )
                }}
              >
                <MenuItem value="">Select User Type</MenuItem>
                {userTypes.map((userType) => (
                  <MenuItem key={userType._id} value={userType.name}>
                    {userType.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {/* DataGrid */}
            <Grid item xs={12} sm={12}>
              <div style={{ height: 400, width: '100%' }}>
                <DataGrid
                  rows={filteredData}
                  columns={columns}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 5 }
                    }
                  }}
                  pageSizeOptions={[5, 10]}
                  checkboxSelection
                />
              </div>
            </Grid>
          </Grid>
        </Grid>
      </MainCard>
    </>
  );
}
