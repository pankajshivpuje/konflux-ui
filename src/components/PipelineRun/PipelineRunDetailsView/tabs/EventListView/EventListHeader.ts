export const eventTableColumnClasses = {
  lastSeen: 'pf-m-width-15',
  type: 'pf-m-width-10',
  reason: 'pf-m-width-15',
  object: 'pf-m-width-20',
  message: 'pf-m-width-40',
};

export const EventListHeader = () => {
  return [
    {
      title: 'Last seen',
      props: { className: eventTableColumnClasses.lastSeen },
    },
    {
      title: 'Type',
      props: { className: eventTableColumnClasses.type },
    },
    {
      title: 'Reason',
      props: { className: eventTableColumnClasses.reason },
    },
    {
      title: 'Object',
      props: { className: eventTableColumnClasses.object },
    },
    {
      title: 'Message',
      props: { className: eventTableColumnClasses.message },
    },
  ];
};
