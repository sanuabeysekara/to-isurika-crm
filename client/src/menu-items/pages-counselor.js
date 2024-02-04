// assets
import { IconKey, IconAffiliate, IconUsers, IconCertificate } from '@tabler/icons';

// constant
const icons = {
  IconKey,
  IconAffiliate,
  IconUsers,
  IconCertificate
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const pagesCounselor = {
  id: 'pages',
  title: 'Tools',
  caption: '',
  type: 'group',
  children: [
    {
      id: 'leads',
      title: 'Leads',
      type: 'collapse',
      icon: icons.IconAffiliate,
      children: [
        {
          id: 'material-icons',
          title: 'View Leads',
          type: 'item',
          external: true,
          url: '/app/leads',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'courses',
      title: 'Courses',
      type: 'collapse',
      icon: icons.IconCertificate,
      children: [
        {
          id: 'material-icons',
          title: 'View Course',
          type: 'item',
          external: true,
          url: '/app/courses',
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default pagesCounselor;
