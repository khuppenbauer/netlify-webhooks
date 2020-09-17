import * as React from 'react';
import { Fragment } from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import { makeStyles } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  Pagination,
  BulkDeleteButton,
  DeleteButton,
} from 'react-admin';
import FilesFilter from './filesFilter';

const useListStyles = makeStyles(theme => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    margin: '0.5rem 0',
  },
  cardTitleContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardContent: theme.typography.body1,
  cardContentRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: '0.5rem 0',
  },
}));

const FilesBulkActionButtons = (props) => (
  <Fragment>
    <BulkDeleteButton {...props} />
  </Fragment>
);

const FilesGrid = (props) => {
  const { data, ids } = props;
  const classes = useListStyles();
  return (
    <div style={{ margin: '1em' }}>
      {ids.map(id => (
        <Card key={id} className={classes.card}>
          <CardHeader
            title={
              <div className={classes.cardTitleContent}>
                <span>
                  File:&nbsp;
                  <TextField source="name" record={data[id]}/>
                </span>
              </div>
            }
          />
        </Card>
      ))}
    </div>
  );
};

const FilesList = (props) => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down('sm'));
  return (
    <List {...props}
      perPage={25}
      filters={<FilesFilter />}
      pagination={<Pagination rowsPerPageOptions={[10, 25, 50, 100]} />}
      sort={{ field: 'updatedAt', order: 'DESC' }}
      bulkActionButtons={<FilesBulkActionButtons />}
    >
      {isSmall ? (
        <FilesGrid />
      ) : (
        <Datagrid>
          <TextField source="name"/>
          <TextField source="mimeType"/>
          <TextField source="extension"/>
          <TextField source="size"/>
          <DateField source="updatedAt"/>
          <DeleteButton/>
        </Datagrid>
      )}
    </List>
  );
};

export default FilesList;
