import * as React from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import MainCard from 'ui-component/cards/MainCard';
import { Button, CardActions, Divider, InputAdornment, useMediaQuery, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import * as Yup from 'yup';
import { Formik } from 'formik';
import { useAuthContext } from '../../../context/useAuthContext';
import { useEffect, useState } from 'react';
import config from '../../../config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
// import Avatar from '@mui/material/Avatar';
// import IconButton from '@mui/material/IconButton';
// import Input from '@mui/material/Input';
// import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useLogout } from '../../../hooks/useLogout';

export default function ProfileForm() {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuthContext();
  const [profileData, setProfileData] = useState({});
  const [passwordFormData, setPasswordFormData] = useState({});
  // const [profilePicture, setProfilePicture] = useState(null);
  // const [loading, setLoading] = useState(false);
  const { logout } = useLogout();

  useEffect(() => {
    if (user) {
      const userData = {
        name: user?.userName,
        email: user?.userEmail
      };
      setProfileData(userData);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const passwordData = {
        password: '',
        confirm_password: ''
      };
      setPasswordFormData(passwordData);
    }
  }, [user]);

  const Toast = withReactContent(
    Swal.mixin({
      toast: true,
      position: 'bottom-end',
      iconColor: 'white',
      customClass: {
        popup: 'colored-toast'
      },
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true
    })
  );

  const showSuccessSwal = () => {
    Toast.fire({
      icon: 'success',
      title: 'Profile Details Saved Successfully.'
    });
  };

  const showErrorSwal = () => {
    Toast.fire({
      icon: 'error',
      title: 'Error While Saving Profile Details.'
    });
  };

  const showPasswordSuccessSwal = () => {
    Toast.fire({
      icon: 'success',
      title: 'Password Saved Successfully.'
    });
  };

  const showPasswordErrorSwal = () => {
    Toast.fire({
      icon: 'error',
      title: 'Error While Saving Password.'
    });
  };

  // const handleProfilePictureUpload = async (event) => {
  //   setLoading(true);

  //   const file = event.target.files[0];
  //   const reader = new FileReader();

  //   reader.readAsDataURL(file);

  //   reader.onload = () => {
  //     setProfilePicture(reader.result);
  //     setLoading(false);
  //   };
  // };

  const handleProfileDetailsSubmit = async (values, helpers) => {
    const formData = {
      name: values.name,
      email: values.email
    };

    console.log(formData);

    try {
      const id = user?._id;
      const res = await fetch(config.apiUrl + `api/updatePassword/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else if (res.status === 500) {
          console.error('Internal Server Error.');
          logout();
        } else {
          console.error('Server response:', res);
          showErrorSwal();
        }
        return;
      }

      const response = await res.json();

      console.log('Server response:', response);
      showSuccessSwal();
      logout();
    } catch (error) {
      console.error('Error submitting form:', error);
      showErrorSwal();
      helpers.setErrors({ submit: error.message });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values, helpers) => {
    const formData = {
      password: values.password
    };
    try {
      const id = user?._id;
      const res = await fetch(config.apiUrl + `api/update-user-password/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        if (res.status === 401) {
          console.error('Unauthorized access. Logging out.');
          logout();
        } else if (res.status === 500) {
          console.error('Internal Server Error.');
          logout();
        } else {
          console.error('Server response:', res);
          showPasswordErrorSwal();
        }
        return;
      }
      const response = await res.json();

      console.log('Server response:', response);
      showPasswordSuccessSwal();
      logout();
    } catch (error) {
      console.error('Error submitting form:', error);
      showPasswordErrorSwal();
      helpers.setErrors({ submit: error.message });
    } finally {
      helpers.setSubmitting(false);
    }
  };

  return (
    <>
      <MainCard title="Manage My Profile">
        {/* Name and Email Form */}
        <Formik
          enableReinitialize
          initialValues={{
            name: profileData.name || '',
            email: profileData.email || '',
            // profilePicture: profilePicture || profileData.profilePictureUrl || null
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string().required('Name is required'),
            email: Yup.string().email('Invalid email address').required('Email is required')
          })}
          onSubmit={handleProfileDetailsSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
            <form onSubmit={handleSubmit}>
              <Grid container direction="column" justifyContent="center">
                <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>
                  {/* <Grid item xs={12} sm={12}>
                    <Avatar
                      src={loading ? <LinearProgress /> : profilePicture || profileData.profilePictureUrl || '/default-profile.png'}
                      sx={{ width: 150, height: 150, mb: 2 }}
                    />
                    <IconButton component="label">
                      <Input type="file" hidden accept="image/*" onChange={handleProfilePictureUpload} />
                      <PhotoCameraIcon />
                    </IconButton>
                  </Grid> */}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Name
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="name"
                      onBlur={(e) => {
                        handleBlur(e);
                        handleChange(e);
                      }}
                      onChange={handleChange}
                      defaultValue={profileData.name}
                      value={values.name}
                      variant="outlined"
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountCircleIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Email
                    </Typography>
                    <TextField
                      fullWidth
                      margin="normal"
                      name="email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={profileData.email}
                      variant="outlined"
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>
                <Divider sx={{ mt: 3, mb: 2 }} />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                    Save Details
                  </Button>
                </CardActions>
              </Grid>
            </form>
          )}
        </Formik>
      </MainCard>
      <div style={{ marginTop: '20px' }}></div>
      <MainCard title="Manage My Password">
        {/* Password Form */}
        <Formik
          enableReinitialize
          initialValues={{
            password: passwordFormData.password,
            confirm_password: passwordFormData.confirm_password
          }}
          validationSchema={Yup.object().shape({
            password: Yup.string().min(5, 'Password must be at least 5 characters').required('Password is required'),
            confirm_password: Yup.string()
              .oneOf([Yup.ref('password'), null], 'Passwords must match')
              .required('Confirm Password is required')
          })}
          onSubmit={handlePasswordSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
            <form onSubmit={handleSubmit}>
              <Grid container direction="column" justifyContent="center">
                <Grid container sx={{ p: 3 }} spacing={matchDownSM ? 0 : 2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      New Password
                    </Typography>
                    <TextField
                      fullWidth
                      type="password"
                      margin="normal"
                      name="password"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.password}
                      variant="outlined"
                      error={Boolean(touched.password && errors.password)}
                      helperText={touched.password && errors.password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="h5" component="h5">
                      Confirm Password
                    </Typography>
                    <TextField
                      fullWidth
                      type="password"
                      margin="normal"
                      name="confirm_password"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.confirm_password}
                      variant="outlined"
                      error={Boolean(touched.confirm_password && errors.confirm_password)}
                      helperText={touched.confirm_password && errors.confirm_password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>
                <Divider sx={{ mt: 3, mb: 2 }} />
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                    Save Password
                  </Button>
                </CardActions>
              </Grid>
            </form>
          )}
        </Formik>
      </MainCard>
    </>
  );
}