
import './style.css'

import classrooms from './data/classrooms.json'
import floors from './data/floors.json'
import facilities from './data/facilities.json'
import faculty from './data/faculty.json'
import departments from './data/departments.json'

// ========================================
// 1. COMBINE ALL DATABASES
// ========================================

const locations = [
  ...classrooms,

  ...facilities,

  ...faculty.map(person => ({
    id: person.id,
    name: person.name,
    type: 'Faculty',
    room: person.room,
    department: person.department,
    floor: person.floor
  })),

  ...departments.map(department => ({
    id: department.id,
    name: department.name,
    type: 'Department',
    shortName: department.shortName,
    floor: department.floor
  }))
]

// ========================================
// 2. APPLICATION STATE
// ========================================

let currentFloor = 0
let selectedLocation = null

// ========================================
// 3. HELPER FUNCTIONS
// ========================================

function getFloorName(floorId) {
  const floor = floors.find(item => item.id === floorId)

  return floor ? floor.name : `Floor ${floorId}`
}

function getLocationDescription(location) {
  if (location.room) {
    return `${location.type} · ${location.room}`
  }

  return location.type
}

// ========================================
// 4. MAIN WEBSITE INTERFACE
// ========================================

document.querySelector('#app').innerHTML = `
  <header class="navbar">
    <div class="brand">
      <div class="brand-icon">C</div>

      <div>
        <h2>Campus<span>Nav</span></h2>
        <small>Indoor Navigation System</small>
      </div>
    </div>

    <div class="nav-status">
      <span class="status-dot"></span>
      Prototype Version
    </div>
  </header>

  <main class="container">

    <section class="welcome">
      <p class="eyebrow">CAMPUS WAYFINDING</p>

      <h1>
        Find your destination.<br>
        <span>Navigate with ease.</span>
      </h1>

      <p class="subtitle">
        Search classrooms, faculty cabins and college facilities.
      </p>
    </section>

    <section class="search-panel">

      <label for="searchInput">
        Where do you want to go?
      </label>

      <div class="search-box">

        <span class="search-icon">⌕</span>

        <input
          id="searchInput"
          type="text"
          placeholder="Search room, faculty or facility..."
          autocomplete="off"
        />

        <button id="searchBtn">
          Search
        </button>

      </div>

      <div id="results" class="results"></div>

    </section>

    <section class="navigation-section">

      <div class="section-heading">

        <div>
          <p class="eyebrow">BUILDING MAP</p>
          <h2>Explore your campus</h2>
        </div>

        <span class="floor-count">
          ${floors.length} Floors
        </span>

      </div>

      <div class="map-layout">

        <aside class="floor-panel">

          <h3>Select Floor</h3>

          <div id="floorButtons" class="floor-buttons">

            ${floors.map(floor => `
              <button
                class="floor-btn ${floor.id === currentFloor ? 'active' : ''}"
                data-floor="${floor.id}"
              >
                ${floor.name}
              </button>
            `).join('')}

          </div>

        </aside>

        <div class="map-panel">

          <div class="map-header">

            <div>
              <h3 id="mapTitle">Ground Floor</h3>

              <p>
                Illustrative sample floor layout
              </p>
            </div>

            <span class="map-label">
              2D MAP
            </span>

          </div>

          <div id="floorMap" class="floor-map"></div>

          <div class="map-legend">
            <span><i class="legend-room"></i> Room</span>
            <span><i class="legend-office"></i> Office</span>
            <span><i class="legend-selected"></i> Destination</span>
          </div>

        </div>

      </div>

    </section>

    <footer>
      <p>
        CampusNav <span>•</span>
        College Indoor Navigation Prototype
      </p>

      <small>
        Sample data for demonstration only
      </small>
    </footer>

  </main>
`

// ========================================
// 5. SELECT HTML ELEMENTS
// ========================================

const searchInput = document.querySelector('#searchInput')
const results = document.querySelector('#results')
const floorButtons = document.querySelector('#floorButtons')
const floorMap = document.querySelector('#floorMap')
const mapTitle = document.querySelector('#mapTitle')

// ========================================
// 6. RENDER FLOOR MAP
// ========================================

function renderMap() {

  const floorLocations = locations.filter(
    location => location.floor === currentFloor
  )

  mapTitle.textContent = getFloorName(currentFloor)

  floorMap.innerHTML = `

    <div class="map-corridor">
      MAIN CORRIDOR
    </div>

    <div class="room-grid">

      ${
        floorLocations.length

        ? floorLocations.map(location => `

          <button
            class="map-room ${
              selectedLocation?.id === location.id
                ? 'selected'
                : ''
            }"
            data-id="${location.id}"
          >

            <span>${location.name}</span>

            <small>
              ${location.room || location.type}
            </small>

          </button>

        `).join('')

        : `
          <p class="empty-floor">
            No sample locations added to this floor.
          </p>
        `
      }

    </div>
  `

  document.querySelectorAll('.map-room').forEach(button => {

    button.addEventListener('click', () => {

      const location = locations.find(
        item => item.id === button.dataset.id
      )

      if (location) {
        selectLocation(location)
      }

    })

  })

}

// ========================================
// 7. SELECT DESTINATION
// ========================================

function selectLocation(location) {

  selectedLocation = location

  currentFloor = location.floor

  // Update active floor button

  document.querySelectorAll('.floor-btn').forEach(button => {

    button.classList.toggle(
      'active',
      Number(button.dataset.floor) === currentFloor
    )

  })

  // Render destination floor

  renderMap()

  // Show destination information

  results.innerHTML = `

    <div class="result-card selected-result">

      <div>

        <strong>${location.name}</strong>

        <p>
          ${getLocationDescription(location)}
          · ${getFloorName(currentFloor)}
        </p>

      </div>

      <span class="destination-tag">
        DESTINATION
      </span>

    </div>

  `

}

// ========================================
// 8. SEARCH LOCATIONS
// ========================================

function searchLocation() {

  const query = searchInput.value.trim().toLowerCase()

  if (!query) {

    results.innerHTML = `
      <p class="message">
        Enter a room or facility name.
      </p>
    `

    return

  }

  // Search across all database categories

  const matches = locations.filter(location => {

    const searchableText = [

      location.name,
      location.type,
      location.room,
      location.department,
      location.shortName

    ].filter(Boolean).join(' ').toLowerCase()

    return searchableText.includes(query)

  })

  if (matches.length === 0) {

    results.innerHTML = `
      <p class="message">
        No matching location found. Try another search.
      </p>
    `

    return

  }

  // Display matching results

  results.innerHTML = matches.map(location => `

    <button
      class="result-card"
      data-id="${location.id}"
    >

      <div>

        <strong>${location.name}</strong>

        <p>
          ${getLocationDescription(location)}
          · ${getFloorName(location.floor)}
        </p>

      </div>

      <span class="view-link">
        View →
      </span>

    </button>

  `).join('')

  // Handle result selection

  document.querySelectorAll('.result-card[data-id]').forEach(button => {

    button.addEventListener('click', () => {

      const location = locations.find(
        item => item.id === button.dataset.id
      )

      if (location) {
        selectLocation(location)
      }

    })

  })

}

// ========================================
// 9. SEARCH BUTTON EVENTS
// ========================================

document
  .querySelector('#searchBtn')
  .addEventListener('click', searchLocation)

searchInput.addEventListener('keydown', event => {

  if (event.key === 'Enter') {
    searchLocation()
  }

})

// ========================================
// 10. FLOOR SELECTION EVENTS
// ========================================

floorButtons.addEventListener('click', event => {

  const button = event.target.closest('.floor-btn')

  if (!button) return

  currentFloor = Number(button.dataset.floor)

  selectedLocation = null

  // Update active button

  document.querySelectorAll('.floor-btn').forEach(item => {

    item.classList.toggle(
      'active',
      item === button
    )

  })

  // Clear previous search results

  results.innerHTML = ''

  // Render selected floor

  renderMap()

})

// ========================================
// 11. INITIALIZE APPLICATION
// ========================================

renderMap()

console.log('CampusNav initialized successfully!')

console.log('Total floors:', floors.length)

console.log('Total locations:', locations.length)

