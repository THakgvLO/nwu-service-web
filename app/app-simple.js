// Simple version without Firebase for testing campus services
console.log('Simple app.js loaded successfully');

// Enhanced campus services with descriptions
const campusServices = {
  Potchefstroom: [
    { name: "Library", description: "Main campus library and study facilities" },
    { name: "Admin Office", description: "Student administration and registration" },
    { name: "Bathroom", description: "Campus restroom facilities" },
    { name: "IT Help Desk", description: "Technical support and computer services" },
    { name: "Cafeteria", description: "Student dining and food services" },
    { name: "Health Center", description: "Student health and wellness services" }
  ],
  Vanderbijlpark: [
    { name: "Library", description: "Campus library and research facilities" },
    { name: "Financial Aid", description: "Student financial assistance and bursaries" },
    { name: "Bathroom", description: "Campus restroom facilities" },
    { name: "Student Centre", description: "Student activities and events center" },
    { name: "Sports Complex", description: "Athletic facilities and gym" },
    { name: "Bookstore", description: "Textbooks and campus supplies" }
  ],
  Mahikeng: [
    { name: "Library", description: "Academic library and study spaces" },
    { name: "Registrar", description: "Student records and academic services" },
    { name: "Bathroom", description: "Campus restroom facilities" },
    { name: "Science Lab", description: "Laboratory facilities and equipment" },
    { name: "Computer Lab", description: "Computer access and printing services" },
    { name: "Student Lounge", description: "Relaxation and social spaces" }
  ]
};

console.log('Campus services data:', campusServices);

// DOM elements
const campusSelect = document.getElementById('campusSelect');
const serviceSelect = document.getElementById('serviceSelect');
const ratingForm = document.getElementById('ratingForm');
const commentInput = document.getElementById('commentInput');
const homeBtn = document.getElementById('homeBtn');
const ratingsList = document.getElementById('ratingsList');
const submitBtn = document.querySelector('button[type="submit"]');

console.log('DOM elements found:', {
  campusSelect: !!campusSelect,
  serviceSelect: !!serviceSelect,
  ratingForm: !!ratingForm,
  homeBtn: !!homeBtn,
  ratingsList: !!ratingsList
});

// Show user feedback
function showMessage(message, type = 'success') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  messageDiv.style.cssText = `
    padding: 10px;
    margin: 10px 0;
    border-radius: 4px;
    text-align: center;
    ${type === 'success' ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 
      'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
  `;
  
  ratingForm.insertBefore(messageDiv, ratingForm.firstChild);
  
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// Update services when campus changes
function updateServices() {
  console.log('updateServices called');
  const campus = campusSelect.value;
  console.log('Selected campus:', campus);
  
  serviceSelect.innerHTML = '<option value="">Choose a service</option>';
  
  if (campus && campusServices[campus]) {
    console.log('Services for campus:', campusServices[campus]);
    campusServices[campus].forEach(service => {
      const opt = document.createElement('option');
      opt.value = service.name;
      opt.textContent = `${service.name} - ${service.description}`;
      serviceSelect.appendChild(opt);
    });
    serviceSelect.disabled = false;
    console.log('Services loaded successfully');
  } else {
    console.log('No services found for campus:', campus);
    serviceSelect.disabled = true;
  }
}

// Add event listener for campus selection
if (campusSelect) {
  campusSelect.addEventListener('change', () => {
    console.log('Campus selection changed');
    updateServices();
  });
  console.log('Campus change listener added');
} else {
  console.error('Campus select element not found!');
}

// Submit rating (local storage version)
if (ratingForm) {
  ratingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const campus = campusSelect.value;
    const service = serviceSelect.value;
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const rating = ratingInput ? parseInt(ratingInput.value) : 0;
    const comment = commentInput.value.trim() || "No comment provided";

    console.log('Form submission:', { campus, service, rating, comment });

    // Validation
    if (!campus || !service || !rating) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    if (rating < 1 || rating > 5) {
      showMessage('Please select a rating between 1 and 5 stars', 'error');
      return;
    }

    // Store in localStorage
    const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
    ratings.push({
      campus,
      service,
      rating,
      comment,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('ratings', JSON.stringify(ratings));
    
    showMessage(`Thank you for rating ${service}! Your feedback helps improve campus services.`);
    ratingForm.reset();
    serviceSelect.innerHTML = '<option value="">Select a campus first</option>';
    serviceSelect.disabled = true;
    
    // Refresh the ratings list
    loadRatings();
  });
} else {
  console.error('Rating form not found!');
}

// Load ratings from localStorage
function loadRatings() {
  const ratings = JSON.parse(localStorage.getItem('ratings') || '[]');
  console.log('Loading ratings:', ratings.length, 'items');
  
  ratingsList.innerHTML = '';
  
  if (ratings.length === 0) {
    ratingsList.innerHTML = '<li class="list-group-item">No ratings yet. Be the first to rate a service!</li>';
    return;
  }
  
  // Show most recent ratings first
  ratings.slice(-5).reverse().forEach(rating => {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    
    const stars = '⭐'.repeat(rating.rating);
    const date = new Date(rating.timestamp).toLocaleDateString();
    
    li.innerHTML = `
      <div class="rating-header">
        <strong>${rating.service}</strong> 
        <span class="campus-badge">${rating.campus}</span>
      </div>
      <div class="rating-stars">${stars}</div>
      <div class="rating-comment">"${rating.comment}"</div>
      <div class="rating-date">${date}</div>
    `;
    ratingsList.appendChild(li);
  });
}

// Home button: reset form
if (homeBtn) {
  homeBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });
} else {
  console.error('Home button not found!');
}

// Initialize services on page load
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  updateServices();
  loadRatings();
  console.log('Initialization complete');
}); 