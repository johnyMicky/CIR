
import fetch from 'node-fetch';

async function test() {
  try {
    const response = await fetch('http://localhost:3000/api/clients');
    const data = await response.json();
    console.log('Clients API response:', data);
  } catch (error) {
    console.error('Error fetching clients:', error);
  }
}

test();
