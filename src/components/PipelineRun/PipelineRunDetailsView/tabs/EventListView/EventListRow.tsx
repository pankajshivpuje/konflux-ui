import React from 'react';
import { Label } from '@patternfly/react-core';
import { RowFunctionArgs, TableData } from '../../../../../shared/components/table';
import { Timestamp } from '../../../../../shared/components/timestamp/Timestamp';
import { EventKind } from '../../../../../types';
import { eventTableColumnClasses } from './EventListHeader';

const EventListRow: React.FC<React.PropsWithChildren<RowFunctionArgs<EventKind>>> = ({ obj }) => {
  const involvedObject = obj.involvedObject;
  const objectRef = `${involvedObject.kind}/${involvedObject.name}`;

  return (
    <>
      <TableData className={eventTableColumnClasses.lastSeen}>
        <Timestamp timestamp={obj.lastTimestamp ?? obj.metadata?.creationTimestamp} />
      </TableData>
      <TableData className={eventTableColumnClasses.type}>
        <Label color={obj.type === 'Warning' ? 'orange' : 'blue'}>{obj.type || 'Normal'}</Label>
      </TableData>
      <TableData className={eventTableColumnClasses.reason}>{obj.reason ?? '-'}</TableData>
      <TableData className={eventTableColumnClasses.object}>{objectRef}</TableData>
      <TableData className={eventTableColumnClasses.message}>{obj.message ?? '-'}</TableData>
    </>
  );
};

export default EventListRow;
