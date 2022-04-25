import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { process } from '@progress/kendo-data-query';
import { Grid, GridColumn as Column, GridToolbar } from '@progress/kendo-react-grid';
import { setGroupIds, getGroupIds, setExpandedState } from '@progress/kendo-react-data-tools';
import products from './products.json';
const initialDataState = {
  take: 10,
  skip: 0,
  group: [{
    field: 'UnitsInStock'
  }, {
    field: 'ProductName'
  }]
};

const processWithGroups = (data, dataState) => {
  const newDataState = process(data, dataState);
  setGroupIds({
    data: newDataState.data,
    group: dataState.group
  });
  return newDataState;
};

const App = () => {
  const [dataState, setDataState] = React.useState(initialDataState);
  const [resultState, setResultState] = React.useState(processWithGroups(products, initialDataState));
  const [collapsedState, setCollapsedState] = React.useState([]);
  const onDataStateChange = React.useCallback(event => {
    const newDataState = processWithGroups(products, event.dataState);
    setDataState(event.dataState);
    setResultState(newDataState);
  }, []);
  const onExpandChange = React.useCallback(event => {
    const item = event.dataItem;

    if (item.groupId) {
      const collapsedIds = !event.value ? [...collapsedState, item.groupId] : collapsedState.filter(groupId => groupId !== item.groupId);
      setCollapsedState(collapsedIds);
    }
  }, [collapsedState]);
  const onGroupsToggle = React.useCallback(() => {
    const dataStateWithoutPaging = processWithGroups(products, {
      group: dataState.group
    });
    setCollapsedState(collapsedState.length ? [] : getGroupIds({
      data: dataStateWithoutPaging.data
    }));
  }, [collapsedState, dataState]);
  const newData = setExpandedState({
    data: resultState.data,
    collapsedIds: collapsedState
  });
  return <Grid 
      style={{
        height: '520px'
      }} 
      pageable={{
        pageSizes: true
      }} 
      groupable={true} 
      data={newData} 
      total={resultState.total} 
      onDataStateChange={onDataStateChange} 
      {...dataState} 
      onExpandChange={onExpandChange} 
      expandField="expanded"
    >
        <GridToolbar>
          <button className="k-button k-button-md k-rounded-md k-button-solid k-button-solid-primary" onClick={onGroupsToggle}>{collapsedState.length ? 'Expand' : 'Collapse'} Groups</button>
        </GridToolbar>
        <Column field="ProductID" filterable={false} title="ID" width="50px" />
        <Column field="ProductName" title="Product Name" />
        <Column field="UnitPrice" title="Unit Price" filter="numeric" />
        <Column field="UnitsInStock" title="Units In Stock" filter="numeric" />
        <Column field="Category.CategoryName" title="Category Name" />
      </Grid>;
};

ReactDOM.render(<App />, document.querySelector('my-app'));