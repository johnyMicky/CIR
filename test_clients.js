fetch('http://localhost:3000/api/clients')
  .then(res => res.json())
  .then(data => {
    if (data.length > 0) {
      console.log(Object.keys(data[0]));
    } else {
      console.log('No clients found');
    }
  })
  .catch(console.error);
