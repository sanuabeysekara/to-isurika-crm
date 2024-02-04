// material-ui
import { Typography } from '@mui/material';

// project imports
import NavGroup from './NavGroup';
import MenuItems from 'menu-items';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
  const menuData = MenuItems();
  const navItems = menuData.items ? menuData.items.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  }) : (
    <Typography variant="h6" color="error" align="center">
      Loading...
    </Typography>
  );

  return <>{navItems}</>;
};

export default MenuList;
