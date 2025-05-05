const carList = document.getElementById('car-list');
const carDetails = document.getElementById('car-details');
const form = document.getElementById('car-form');

let neptun = localStorage.getItem('neptun') || '';
if (!neptun) {
  neptun = prompt('Add meg a Neptun-kódod (pl. TEST01):');
  localStorage.setItem('neptun', neptun);
}

function fetchCars() {
  fetch(`https://iit-playground.arondev.hu/api/${neptun}/car`)
    .then(res => res.json())
    .then(car => {
      carList.innerHTML = '';
      car.forEach(c => {
        const card = document.createElement('div');
        card.className = 'car-card';
        card.innerHTML = `
          <h2>${c.brand} ${c.model}</h2>
          <p>Évjárat: ${c.dayOfCommission}</p>
          <p>Tulajdonos: ${c.owner}</p>
        `;
        card.addEventListener('click', () => showCarDetails(c.id));
        carList.appendChild(card);
      });
    });
}

function showCarDetails(id) {
  fetch(`https://iit-playground.arondev.hu/api/${neptun}/car/${id}`)
    .then(res => res.json())
    .then(car => {
      carDetails.innerHTML = `
        <h2>Adatlap</h2>
        <button id="close-details" title="Bezárás">&times;</button>
        <p><strong>ID:</strong> ${car.id}</p>
        <p><strong>Márka:</strong> ${car.brand}</p>
        <p><strong>Modell:</strong> ${car.model}</p>
        <p><strong>Elektromos:</strong> ${car.electric}</p>
        <p><strong>Üzemanyag fogyasztás:</strong> ${car.fuelUse}</p>
        <p><strong>Évjárat:</strong> ${car.dayOfCommission}</p>
        <p><strong>Tulajdonos:</strong> ${car.owner}</p>
        <button id="edit-btn">Szerkesztés</button>
        <button id="delete-btn">Törlés</button>
      `;
      carDetails.classList.remove('hidden');
      carDetails.scrollIntoView({ behavior: 'smooth' });

      document.getElementById('close-details').onclick = () => {
        carDetails.classList.add('hidden');
      };

      document.getElementById('edit-btn').onclick = () => {
        document.getElementById('car-id').value = car.id;
        document.getElementById('brand').value = car.brand;
        document.getElementById('model').value = car.model;
        document.getElementById('electric').value = car.electric ? 'true' : 'false';
        document.getElementById('fuelUse').value = car.fuelUse;
        document.getElementById('dayOfCommission').value = car.dayOfCommission;
        document.getElementById('owner').value = car.owner;

        const fuelInput = document.getElementById('fuelUse');
        if (car.electric) {
          fuelInput.value = '0';
          fuelInput.disabled = true;
        } else {
          fuelInput.disabled = false;
        }

        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      };

      document.getElementById('delete-btn').onclick = () => {
        if (confirm('Biztosan törlöd ezt az autót?')) {
          fetch(`https://iit-playground.arondev.hu/api/${neptun}/car/${car.id}`, {
            method: 'DELETE',
          })
          .then(() => {
            fetchCars();
            carDetails.classList.add('hidden');
          });
        }
      };
    });
}

const electricSelect = document.getElementById('electric');
electricSelect.addEventListener('change', () => {
  const fuelInput = document.getElementById('fuelUse');
  if (electricSelect.value === 'true') {
    fuelInput.value = '0';
    fuelInput.disabled = true;
  } else {
    fuelInput.disabled = false;
  }
});

form.addEventListener('submit', function (e) {
  e.preventDefault();

  const car = {
    id: document.getElementById('car-id').value ? parseInt(document.getElementById('car-id').value) : undefined,
    brand: document.getElementById('brand').value,
    model: document.getElementById('model').value,
    electric: document.getElementById('electric').value === 'true',
    fuelUse: parseFloat(document.getElementById('fuelUse').value),
    dayOfCommission: document.getElementById('dayOfCommission').value,
    owner: document.getElementById('owner').value,
  };

  const method = car.id ? 'PUT' : 'POST';
  const url = `https://iit-playground.arondev.hu/api/${neptun}/car`;

  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(car),
  })
    .then(res => {
      if (!res.ok) {
        return res.text().then(text => { throw new Error(text); });
      }
      return res.json();
    })
    .then((updatedCar) => {
      form.reset();
      document.getElementById('car-id').value = '';
      document.getElementById('fuelUse').disabled = false;
      fetchCars();
      if (updatedCar?.id) {
        showCarDetails(updatedCar.id);
      }
    })
    .catch(err => {
      alert('Hiba történt: ' + err.message);
    });
});

document.addEventListener('DOMContentLoaded', fetchCars);
