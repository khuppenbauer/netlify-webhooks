import * as React from 'react';
import MuiGridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { makeStyles } from '@material-ui/core/styles';
import withWidth from '@material-ui/core/withWidth';
import { linkToRecord } from 'ra-core';
import { List } from 'react-admin';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    margin: '-2px',
  },
  gridList: {
    width: '100%',
    margin: 0,
  },
  tileBar: {
    background:
      'linear-gradient(to top, rgba(0,0,0,0.8) 0%,rgba(0,0,0,0.4) 70%,rgba(0,0,0,0) 100%)',
  },
  placeholder: {
    backgroundColor: theme.palette.grey[300],
    height: '100%',
  },
  price: {
    display: 'inline',
    fontSize: '1em',
  },
  link: {
    color: '#fff',
  },
}));

const getColsForWidth = (width) => {
  if (width === 'xs') return 2;
  if (width === 'sm') return 3;
  if (width === 'md') return 4;
  if (width === 'lg') return 5;
  return 6;
};

const PhotosGrid = ({ ids, data, basePath, width }) => {
  const classes = useStyles();
  console.log(basePath);
  if (!ids || !data) return null;

  return (
    <div className={classes.root}>
      <MuiGridList
        cellHeight={180}
        cols={getColsForWidth(width)}
        className={classes.gridList}
      >
        {ids.map((id) => (
          <GridListTile
            // @ts-ignore
            component={Link}
            key={id}
            to={linkToRecord(basePath, data[id].id) + '/show'}
          >
            <img src={data[id].url} alt="" />
          </GridListTile>
        ))}
      </MuiGridList>
    </div>
  );
};

const PhotosList = (props) => (
  <List
    {...props}
    perPage={25}
    sort={{ field: 'shootingDate', order: 'DESC' }}
  >
    <PhotosGrid {...props} />
  </List>
);

export default withWidth()(PhotosList);
