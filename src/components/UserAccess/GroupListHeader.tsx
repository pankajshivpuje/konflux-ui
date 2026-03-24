export const groupTableColumnClasses = {
  groupName: 'pf-m-width-25',
  members: 'pf-m-width-20',
  role: 'pf-m-width-20',
  kebab: 'pf-v5-c-table__action',
};

export const groupListHeader = () => [
  {
    title: 'Group Name',
    props: { className: groupTableColumnClasses.groupName },
  },
  {
    title: 'Members',
    props: { className: groupTableColumnClasses.members },
  },
  {
    title: 'Role',
    props: { className: groupTableColumnClasses.role },
  },
  {
    title: ' ',
    props: { className: groupTableColumnClasses.kebab },
  },
];
