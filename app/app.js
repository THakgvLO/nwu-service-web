// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, onSnapshot, limit, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB91prjUz_5wkV_Cy_spRKrrALGiotBCh8",
  authDomain: "nwu-service-app.firebaseapp.com",
  projectId: "nwu-service-app",
  storageBucket: "nwu-service-app.appspot.com",
  messagingSenderId: "178834881312",
  appId: "1:178834881312:web:d2b0e7bfe54d3be1b9f545",
  measurementId: "G-8NC7N4ZDBY"
};

// Initialize Firebase
let db;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // Mock db object for fallback
  db = {
    collection: () => ({
      addDoc: () => Promise.resolve({ id: 'mock-id' }),
      onSnapshot: () => () => {}
    })
  };
}

// Campus services data
const campusServices = {
  Potchefstroom: [
    { name: 'Library', description: 'Main campus library with extensive resources' },
    { name: 'Cafeteria', description: 'Student dining facilities' },
    { name: 'IT Support', description: 'Technical support and computer labs' },
    { name: 'Transport', description: 'Campus shuttle and parking services' },
    { name: 'Health Center', description: 'Student health and wellness services' },
    { name: 'Sports Center', description: 'Recreation and fitness facilities' }
  ],
  Vanderbijlpark: [
    { name: 'Library', description: 'Modern library with digital resources' },
    { name: 'Cafeteria', description: 'Contemporary dining options' },
    { name: 'IT Support', description: 'Advanced technology support' },
    { name: 'Transport', description: 'Efficient campus transportation' },
    { name: 'Health Center', description: 'Comprehensive health services' },
    { name: 'Sports Center', description: 'State-of-the-art sports facilities' }
  ],
  Mahikeng: [
    { name: 'Library', description: 'Historic library with unique collections' },
    { name: 'Cafeteria', description: 'Traditional and modern dining' },
    { name: 'IT Support', description: 'Reliable technical assistance' },
    { name: 'Transport', description: 'Campus and city transportation' },
    { name: 'Health Center', description: 'Quality healthcare services' },
    { name: 'Sports Center', description: 'Diverse recreational facilities' }
  ]
};

// DOM elements
const elements = {
  campusSelect: document.getElementById('campusSelect'),
  serviceSelect: document.getElementById('serviceSelect'),
  ratingForm: document.getElementById('ratingForm'),
  ratingInput: document.getElementById('ratingInput'),
  ratingValue: document.getElementById('ratingValue'),
  commentInput: document.getElementById('commentInput'),
  ratingsList: document.getElementById('ratingsList'),
  homeBtn: document.getElementById('homeBtn')
};

// Utility functions
function setLoading(isLoading) {
  const submitBtn = document.querySelector('.card-btn.primary');
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Submitting...' : 'Submit Rating';
  }
}

function showMessage(message, type = 'success') {
  // Remove existing messages
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;

  // Insert message before the form
  const form = document.getElementById('ratingForm');
  if (form) {
    form.parentNode.insertBefore(messageDiv, form);
  }

  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (messageDiv.parentNode) {
      messageDiv.remove();
    }
  }, 5000);
}

// Update services dropdown based on campus selection
function updateServices() {
  const selectedCampus = elements.campusSelect.value;
  const serviceSelect = elements.serviceSelect;
  
  // Clear current options
  serviceSelect.innerHTML = '<option value="">Select a campus first</option>';
  
  if (selectedCampus && campusServices[selectedCampus]) {
    // Enable service select
    serviceSelect.disabled = false;
    
    // Add service options
    campusServices[selectedCampus].forEach(service => {
      const option = document.createElement('option');
      option.value = service.name;
      option.textContent = service.name;
      serviceSelect.appendChild(option);
    });
  } else {
    // Disable service select
    serviceSelect.disabled = true;
  }
}

// Initialize star rating system (10 stars: 0.5 to 5.0)
function initializeStarRating() {
  const stars = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('ratingInput');
  const ratingValue = document.getElementById('ratingValue');
  const starDisplays = document.querySelectorAll('.star-display');

  let currentRating = 0;

  stars.forEach((star) => {
    const rating = parseFloat(star.dataset.rating);
    
    // Click event
    star.addEventListener('click', () => {
      currentRating = rating;
      updateStarDisplay(rating);
      ratingInput.value = rating;
      ratingValue.textContent = rating.toFixed(1);
    });

    // Hover events for preview
    star.addEventListener('mouseenter', () => {
      updateStarDisplay(rating, true);
    });

    star.addEventListener('mouseleave', () => {
      updateStarDisplay(currentRating, false);
    });
  });
}

// Update star display
function updateStarDisplay(rating, isPreview = false) {
  const starDisplays = document.querySelectorAll('.star-display');
  const stars = document.querySelectorAll('.star');

  // Update display stars (5 stars)
  starDisplays.forEach((star, index) => {
    const starNumber = index + 1; // 1, 2, 3, 4, 5
    star.classList.remove('active', 'half-active');

    if (rating >= starNumber) {
      // Full star
      star.classList.add('active');
    } else if (rating >= starNumber - 0.5) {
      // Half star
      star.classList.add('half-active');
    }
  });

  // Update input stars (10 stars)
  stars.forEach((star) => {
    const starRating = parseFloat(star.dataset.rating);
    star.classList.remove('active');
    
    if (rating >= starRating) {
      star.classList.add('active');
    }
  });

  // Update display text
  const ratingValue = document.getElementById('ratingValue');
  if (!isPreview && ratingValue) {
    ratingValue.textContent = rating.toFixed(1);
  }
}

// Get star display string for ratings
function getStarDisplay(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
}

// Handle form submission
async function handleFormSubmit(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const rating = parseFloat(formData.get('rating'));
  const campus = formData.get('campus');
  const service = formData.get('service');
  const comment = formData.get('comment');

  // Validation
  if (!campus || !service) {
    showMessage('Please select both campus and service.', 'error');
    return;
  }

  if (!rating || rating < 0.5 || rating > 5) {
    showMessage('Please provide a valid rating between 0.5 and 5.0.', 'error');
    return;
  }

  setLoading(true);

  try {
    const ratingData = {
      campus,
      service,
      rating,
      comment: comment.trim() || 'No comment provided',
      timestamp: new Date()
    };

    await addDoc(collection(db, 'ratings'), ratingData);
    
    showMessage('Rating submitted successfully! Thank you for your feedback.');
    event.target.reset();
    
    // Reset star display
    updateStarDisplay(0);
    
  } catch (error) {
    console.error('Error submitting rating:', error);
    showMessage('Failed to submit rating. Please try again.', 'error');
  } finally {
    setLoading(false);
  }
}

// Load and display recent ratings
function loadRecentRatings() {
  try {
    const ratingsRef = collection(db, 'ratings');
    const q = ratingsRef.orderBy('timestamp', 'desc').limit(20);

    onSnapshot(q, (snapshot) => {
      const ratings = [];
      snapshot.forEach((doc) => {
        ratings.push({ id: doc.id, ...doc.data() });
      });

      displayRatings(ratings);
    }, (error) => {
      console.error('Error loading ratings:', error);
      elements.ratingsList.innerHTML = '<li class="rating-item error">Error loading recent reviews.</li>';
    });
  } catch (error) {
    console.error('Error setting up ratings listener:', error);
  }
}

// Display ratings in the list
function displayRatings(ratings) {
  if (ratings.length === 0) {
    elements.ratingsList.innerHTML = '<li class="rating-item">No reviews yet. Be the first to rate a service!</li>';
    return;
  }

  elements.ratingsList.innerHTML = ratings.map(rating => {
    const date = rating.timestamp?.toDate ? rating.timestamp.toDate() : new Date(rating.timestamp);
    const formattedDate = date.toLocaleDateString();
    const starDisplay = getStarDisplay(rating.rating);
    
    return `
      <li class="rating-item">
        <div class="rating-header">
          <span class="rating-service">${rating.service} (${rating.campus})</span>
          <span class="rating-date">${formattedDate}</span>
        </div>
        <div class="rating-stars">${starDisplay} ${rating.rating.toFixed(1)}</div>
        <div class="rating-comment">${rating.comment}</div>
      </li>
    `;
  }).join('');
}

// Initialize the application
function initializeApp() {
  console.log('Initializing NWU Services App...');

  // Add event listeners
  if (elements.campusSelect) {
    elements.campusSelect.addEventListener('change', updateServices);
  }

  if (elements.ratingForm) {
    elements.ratingForm.addEventListener('submit', handleFormSubmit);
  }

  if (elements.homeBtn) {
    elements.homeBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }

  // Initialize star rating system
  initializeStarRating();

  // Load recent ratings
  loadRecentRatings();

  console.log('App initialization complete');
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}