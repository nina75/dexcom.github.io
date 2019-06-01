function route(originKey, pathKey) {
  
  const routes = {
    origin: {
      sts: 'https://summertime-sadness.herokuapp.com'
    },
    path: {
      egvs: '/api/dexcom/egvs'
    }
  };
  
  return routes.origin[originKey] + routes.path[pathKey];
}