function route(originKey, pathKey) {
  
  const routes = {
    origin: {
      sts: 'https://summertime-sadness.herokuapp.com'
    },
    path: {
      egvs: '/api/dexcom/egvs',
      latest: '/api/sugarmate/latest'
    }
  };
  
  return routes.origin[originKey] + routes.path[pathKey];
}

var User = (function() {
	
	function getDora() {
		return 10;
	}
	
	function getVuchka() {
		return 12;
	}
	
	return {
		getDora: getDora,
		getVuchka: getVuchka
	};
})();
