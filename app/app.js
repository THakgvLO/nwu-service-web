import { db } from './firebase-config.js';
import { collection, addDoc, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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

console.log('App.js loaded successfully');
console.log('Campus services data:', campusServices);

// DOM elements
const campusSelect = document.getElementById('campusSelect');
const serviceSelect = document.getElementById('serviceSelect');
const ratingForm = document.getElementById('ratingForm');
const commentInput = document.getElementById('commentInput');
const homeBtn = document.getElementById('homeBtn');
const ratingsList = document.getElementById('ratingsList');
const submitBtn = document.querySelector('button[type="submit"]');
const loadingSpinner = document.getElementById('loadingSpinner');

console.log('DOM elements found:', {
  campusSelect: !!campusSelect,
  serviceSelect: !!serviceSelect,
  ratingForm: !!ratingForm,
  homeBtn: !!homeBtn,
  ratingsList: !!ratingsList
});

// Loading state management
function setLoading(isLoading) {
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Submitting...' : 'Submit Rating';
  }
  if (loadingSpinner) {
    loadingSpinner.style.display = isLoading ? 'block' : 'none';
  }
}

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
} else {
  console.error('Campus select element not found!');
}

// Submit rating to Firebase (with fallback for testing)
if (ratingForm) {
  ratingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const campus = campusSelect.value;
    const service = serviceSelect.value;
    const rating = parseFloat(document.getElementById('ratingInput').value) || 0;
    const comment = commentInput.value.trim() || "No comment provided";

    console.log('Form submission:', { campus, service, rating, comment });

    // Validation
    if (!campus || !service || !rating) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }

    if (rating < 0.5 || rating > 5) {
      showMessage('Please select a rating between 0.5 and 5 stars', 'error');
      return;
    }

    setLoading(true);

    try {
      // Try to submit to Firebase
      await addDoc(collection(db, 'ratings'), {
        campus,
        service,
        rating,
        comment,
        timestamp: new Date()
      });
      
      showMessage(`Thank you for rating ${service}! Your feedback helps improve campus services.`);
      ratingForm.reset();
      serviceSelect.innerHTML = '<option value="">Select a campus first</option>';
      serviceSelect.disabled = true;
      
    } catch (err) {
      console.error('Error submitting rating:', err);
      
      // Fallback: Store in localStorage for testing
      const testRatings = JSON.parse(localStorage.getItem('testRatings') || '[]');
      testRatings.push({
        campus,
        service,
        rating,
        comment,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('testRatings', JSON.stringify(testRatings));
      
      showMessage(`Thank you for rating ${service}! (Test mode - stored locally)`);
      ratingForm.reset();
      serviceSelect.innerHTML = '<option value="">Select a campus first</option>';
      serviceSelect.disabled = true;
    } finally {
      setLoading(false);
    }
  });
} else {
  console.error('Rating form not found!');
}

// Load recent ratings in real-time with better formatting (with fallback)
try {
  const q = query(collection(db, 'ratings'), orderBy('timestamp', 'desc'), limit(20));
  onSnapshot(q, (snapshot) => {
    console.log('Ratings loaded:', snapshot.size, 'items');
    ratingsList.innerHTML = '';
    
    if (snapshot.empty) {
      // Check for test ratings
      const testRatings = JSON.parse(localStorage.getItem('testRatings') || '[]');
      if (testRatings.length > 0) {
        testRatings.slice(0, 5).forEach(rating => {
          const li = document.createElement('li');
          li.className = 'list-group-item';
          const stars = getStarDisplay(rating.rating);
          const date = new Date(rating.timestamp).toLocaleDateString();
          
          li.innerHTML = `
            <div class="rating-header">
              <strong>${rating.service}</strong> 
              <span class="campus-badge">${rating.campus} (Test)</span>
            </div>
            <div class="rating-stars">${stars}</div>
            <div class="rating-comment">"${rating.comment}"</div>
            <div class="rating-date">${date}</div>
          `;
          ratingsList.appendChild(li);
        });
      } else {
        ratingsList.innerHTML = '<li class="list-group-item">No ratings yet. Be the first to rate a service!</li>';
      }
      return;
    }
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const li = document.createElement('li');
      li.className = 'list-group-item';
      
      const stars = getStarDisplay(data.rating);
      const date = new Date(data.timestamp.toDate()).toLocaleDateString();
      
      li.innerHTML = `
        <div class="rating-header">
          <strong>${data.service}</strong> 
          <span class="campus-badge">${data.campus}</span>
        </div>
        <div class="rating-stars">${stars}</div>
        <div class="rating-comment">"${data.comment}"</div>
        <div class="rating-date">${date}</div>
      `;
      ratingsList.appendChild(li);
    });
  }, (error) => {
    console.error('Error loading ratings:', error);
    // Show test ratings as fallback
    const testRatings = JSON.parse(localStorage.getItem('testRatings') || '[]');
    if (testRatings.length > 0) {
      testRatings.slice(0, 5).forEach(rating => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        const stars = getStarDisplay(rating.rating);
        const date = new Date(rating.timestamp).toLocaleDateString();
        
        li.innerHTML = `
          <div class="rating-header">
            <strong>${rating.service}</strong> 
            <span class="campus-badge">${rating.campus} (Test)</span>
          </div>
          <div class="rating-stars">${stars}</div>
          <div class="rating-comment">"${rating.comment}"</div>
          <div class="rating-date">${date}</div>
        `;
        ratingsList.appendChild(li);
      });
    } else {
      ratingsList.innerHTML = '<li class="list-group-item error">Error loading ratings. Please refresh the page.</li>';
    }
  });
} catch (error) {
  console.error('Error setting up ratings listener:', error);
  // Show test ratings as fallback
  const testRatings = JSON.parse(localStorage.getItem('testRatings') || '[]');
  if (testRatings.length > 0) {
    testRatings.slice(0, 5).forEach(rating => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      const stars = getStarDisplay(rating.rating);
      const date = new Date(rating.timestamp).toLocaleDateString();
      
      li.innerHTML = `
        <div class="rating-header">
          <strong>${rating.service}</strong> 
          <span class="campus-badge">${rating.campus} (Test)</span>
        </div>
        <div class="rating-stars">${stars}</div>
        <div class="rating-comment">"${rating.comment}"</div>
        <div class="rating-date">${date}</div>
      `;
      ratingsList.appendChild(li);
    });
  }
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
  
  // Initialize star rating system
  initializeStarRating();
  
  // Add loading spinner if it doesn't exist
  if (!loadingSpinner) {
    const spinner = document.createElement('div');
    spinner.id = 'loadingSpinner';
    spinner.innerHTML = '⏳';
    spinner.style.cssText = 'display: none; text-align: center; font-size: 20px; margin: 10px 0;';
    ratingForm.appendChild(spinner);
  }
  
  console.log('Initialization complete');
});

// Initialize interactive star rating system
function initializeStarRating() {
  const stars = document.querySelectorAll('.star');
  const ratingInput = document.getElementById('ratingInput');
  const ratingValue = document.getElementById('ratingValue');
  
  let currentRating = 0;
  
  stars.forEach((star, index) => {
    // Click event with half-star detection
    star.addEventListener('click', (e) => {
      const rect = star.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const starWidth = rect.width;
      
      // Determine if click is on left (half star) or right (full star) side
      const isHalfStar = clickX < starWidth / 2;
      const baseRating = index + 1; // 1, 2, 3, 4, 5
      const rating = isHalfStar ? baseRating - 0.5 : baseRating;
      
      currentRating = rating;
      updateStarDisplay(rating);
      ratingInput.value = rating;
      ratingValue.textContent = rating.toFixed(1);
    });
    
    // Hover events for preview
    star.addEventListener('mouseenter', (e) => {
      const rect = star.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const starWidth = rect.width;
      
      const isHalfStar = mouseX < starWidth / 2;
      const baseRating = index + 1; // 1, 2, 3, 4, 5
      const rating = isHalfStar ? baseRating - 0.5 : baseRating;
      
      updateStarDisplay(rating, true);
    });
    
    star.addEventListener('mouseleave', () => {
      updateStarDisplay(currentRating, false);
    });
  });
}

// Update star display
function updateStarDisplay(rating, isPreview = false) {
  const stars = document.querySelectorAll('.star');
  
  stars.forEach((star, index) => {
    const starNumber = index + 1; // 1, 2, 3, 4, 5
    star.classList.remove('active', 'half-active');
    
    if (rating >= starNumber) {
      // Full star
      star.classList.add('active');
    } else if (rating >= starNumber - 0.5) {
      // Half star
      star.classList.add('half-active');
    }
    // If rating < starNumber - 0.5, star remains gray (default)
  });
  
  // Update display text
  const ratingValue = document.getElementById('ratingValue');
  if (!isPreview) {
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